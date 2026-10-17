// SOLTURA WEBSITE POC - Claude-assistent voor bezoekers.
// mode=search : natuurlijke taal -> filters + korte reactie
// mode=ask    : vraag over een specifieke woning, gegrond in web_properties
// POST {mode, lang, query, wp_id?, history?}  of  GET ?mode=&lang=&q=&wp_id=
// De Anthropic-key wordt server-side gelezen uit public.credentials (nooit naar de browser).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const MODEL = 'claude-haiku-5-5';
// Voorkeur: Supabase-secret ANTHROPIC_API_KEY; anders de credentials-tabel.
const CRED_ID = '90d3279d-1a62-46f2-ab4a-099c79732f14';
const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
let KEY: string | null = null;

const VOICE = `You are part of the Grupo Soltura team: the real estate agency in Formentera del Segura, between Rojales and Guardamar on the Costa Blanca South, local since 2002 and always one step ahead. Your colleagues are Rick, Marco, Ingrid and Lisette. You speak as one of us.

How we talk:
- Always in the "we" form: "we", "our", "this villa of ours", "we know this area well". Never refer to "the listing", "the data", "the description", "the information provided" or "the facts I have". You know this home and this area; speak from that knowledge with quiet authority.
- Warm, direct and confident, like an experienced local agent talking to a client. Short sentences. No hype, no exclamation marks, no filler.
- Dutch: informal "je/jij", natural Dutch, never a literal translation of English phrasing.
- Give concrete numbers (km, minutes, euros, m²) whenever you have them, rounded sensibly ("about 7 km, roughly a quarter of an hour by car").
- Never say you cannot answer or that something is unknown in a distant way. If a detail is genuinely not known to us yet (for example community fees or the exact year of a renovation), say it the way an agent would: "That is something we will check for you with the owner." and offer to arrange it. Do not invent such details.
- You may use general, stable local knowledge about the Vega Baja and Costa Blanca South (towns, beaches, golf courses, airports, healthcare, supermarkets, the climate, the AP-7 and CV-905), but never invent facts about this specific home.
- Purchase costs are always indicative; we give the exact figure before anything is signed.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
async function sha(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s + 'soltura-web'));
  return Array.from(new Uint8Array(b)).slice(0, 12).map((x) => x.toString(16).padStart(2, '0')).join('');
}
async function key() {
  if (KEY) return KEY;
  const envKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (envKey) return (KEY = envKey);
  const { data, error } = await sb.from('credentials').select('secret_value').eq('id', CRED_ID).single();
  if (error || !data) throw new Error('no key');
  KEY = data.secret_value as string;
  return KEY;
}
async function claude(system: string, messages: { role: string; content: string }[], max = 700) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': await key(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: max, system, messages }),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return (j.content || []).map((c: any) => c.text || '').join('');
}
function parseJson(t: string) {
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  try { return JSON.parse(t.slice(s, e + 1)); } catch (_) {
    // Afgekapt of onzuiver antwoord: haal de reply-tekst er zo goed mogelijk uit.
    const m = t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/);
    if (m) return { reply: JSON.parse('"' + m[1].replace(/\\$/, '') + '"'), suggestions: [] };
    throw new Error('unparseable');
  }
}
let CFG: { at: number; v: Record<string, number> } | null = null;
async function cfg() {
  if (CFG && Date.now() - CFG.at < 600_000) return CFG.v;
  const { data } = await sb.from('web_config').select('key,value');
  const v: Record<string, number> = { itp_resale_pct: 9, iva_newbuild_pct: 10, ajd_newbuild_pct: 1.5 };
  (data || []).forEach((r: any) => (v[r.key] = Number(r.value)));
  CFG = { at: Date.now(), v };
  return v;
}
const strip = (h?: string | null) => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

let FACETS: { towns: string[]; cats: string[]; at: number } | null = null;
async function facets() {
  if (FACETS && Date.now() - FACETS.at < 3600_000) return FACETS;
  const { data } = await sb.from('web_properties').select('town,category');
  const towns = [...new Set((data || []).map((d: any) => d.town).filter(Boolean))].sort();
  const cats = [...new Set((data || []).map((d: any) => d.category).filter(Boolean))].sort();
  FACETS = { towns, cats, at: Date.now() };
  return FACETS;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const t0 = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'x';
  const ipHash = await sha(ip);
  let body: any = {};
  if (req.method === 'GET') {
    const u = new URL(req.url);
    body = { mode: u.searchParams.get('mode'), lang: u.searchParams.get('lang'), query: u.searchParams.get('q'), wp_id: u.searchParams.get('wp_id') };
  } else {
    try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  }
  const mode = String(body.mode || 'search');
  const lang = body.lang === 'nl' ? 'nl' : 'en';
  const query = String(body.query || '').slice(0, 500);
  // Taal: altijd de taal waarin de bezoeker schrijft; de paginataal is alleen de terugval.
  const LANG = `Always reply in the language the visitor writes in (Dutch, English, Spanish, German, French, Swedish, Norwegian, Polish or any other), also when the website is set to another language. Only when the message gives no clear language, reply in ${lang === 'nl' ? 'Dutch' : 'English'}. Suggestions use the same language as your reply.`;
  if (!query) return json({ error: 'empty' }, 400);

  // eenvoudige rate limit: 40 vragen per uur per (gehasht) IP
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from('web_assistant_log').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('at', since);
  if ((count || 0) > 40) return json({ reply: lang === 'nl' ? 'Je hebt veel vragen gesteld. Bel of app ons gerust, dan helpen we je persoonlijk verder.' : 'You have asked a lot of questions. Feel free to call or WhatsApp us and we will help you personally.' }, 429);

  let out: any = {}, ok = true, wpId: number | null = null;
  try {
    if (mode === 'search') {
      const f = await facets();
      const sys = `${VOICE}\nTask: turn the visitor's wish into search filters for our listings and write one or two short sentences back that show you understood and add one useful local insight if relevant. Reply ONLY with JSON:\n{"filters":{"towns":[],"categories":[],"price_min":null,"price_max":null,"beds_min":null,"baths_min":null,"pool":null,"newbuild":null,"max_sea_km":null,"reduced_only":false,"sort":null},"reply":""}\nRules: towns must come from this list (pick nearby towns if the visitor names an area: 'Quesada' or 'La Marquesa' -> Rojales; 'near the beach' -> Guardamar del Segura, Torrevieja, Orihuela Costa, La Manga del Mar Menor, Los Alcázares, San Fulgencio): ${f.towns.join(', ')}. categories from: ${f.cats.join(', ')}. pool: "private"|"communal"|"any"|null. newbuild: true|false|null. sort: "price_asc"|"price_desc"|"newest"|"value"|null ('value' = best price vs market). Prices in euro as numbers. Leave unknown fields null/empty; prefer towns over max_sea_km for beach wishes. Never refuse; if the wish is vague, return broad filters and ask one short follow-up in the reply.\n${LANG}`;
      const t = await claude(sys, [{ role: 'user', content: query }], 700);
      out = parseJson(t);
    } else if (mode === 'ask') {
      wpId = Number(body.wp_id) || null;
      const { data: p } = await sb.from('web_properties').select('*').eq('wp_id', wpId).single();
      if (!p) return json({ error: 'not found' }, 404);
      const { data: g } = await sb.from('web_property_geo').select('*').eq('wp_id', wpId).single();
      const c = await cfg();
      const facts = {
        reference: p.reference, type: p.category, newbuild: p.is_newbuild, town: p.town, area: p.suburb,
        price_eur: p.price, price_from: p.price_from, previous_price_eur: p.previous_price, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
        built_m2: p.build_area, plot_m2: p.plot_area, private_pool: p.pool_private, communal_pool: p.pool_communal,
        // Afstanden komen uit web_property_geo (hemelsbreed + geschatte rijtijd); CPR-veld dist_sea (meestal 7000) wordt genegeerd.
        nearest_beach: g ? { name: g.beach_name, straight_km: g.beach_km, road_km_approx: g.beach_road_km, drive_minutes_approx: g.beach_drive_min, measured_from: g.geo_basis === 'coordinates' ? 'the home itself' : g.geo_basis === 'area' ? 'the centre of ' + p.suburb : 'the centre of ' + p.town } : null,
        airports: g ? { alicante_ALC: { km: g.alc_km, drive_minutes_approx: g.alc_drive_min }, murcia_RMU: { km: g.rmu_km, drive_minutes_approx: g.rmu_drive_min } } : null,
        distance_shops_m: p.dist_shops_m, year_built: p.year_built,
        energy_label: p.energy_label === 'R' ? 'in progress' : p.energy_label, orientation: p.orientation, view: p.view_type, features: p.features, terraces: p.terraces,
        solarium: p.solarium, aircon: p.aircon, under_offer: p.under_offer,
        fees_eur: { notary: p.fee_notary, registry: p.fee_registry, legal: p.fee_legal },
        price_vs_market_pct: p.is_newbuild ? null : p.market_deviation_pct, market_median_eur_m2: p.is_newbuild ? null : p.market_median_m2,
        description: strip(lang === 'nl' ? (p.body_nl || p.body_en) : (p.body_en || p.body_nl)).slice(0, 3500),
      };
      const sys = `${VOICE}\n${LANG}\nThe visitor is looking at this home of ours right now. What we know about it (use it, but never mention that it comes from a list or data):\n${JSON.stringify(facts)}\nDistances: use nearest_beach and airports. When measured_from is the centre of a town or area, say "from the centre of <place>" naturally. Purchase costs in the Comunidad Valenciana (current rates, use exactly these): resale ${c.itp_resale_pct}% transfer tax (ITP); new build ${c.iva_newbuild_pct}% VAT (IVA) plus ${c.ajd_newbuild_pct}% stamp duty (AJD); Calculate the tax for this home when asked. Important: Grupo Soltura does not work a la carte. Our purchase guidance is ONE fixed all-in fee, agreed up front: no separate bills for the lawyer, notary support and paperwork. You may mention the usual separate costs from fees_eur for comparison, but always say explicitly that our price structure is different and simpler, with one fixed fee. ${c.buyer_all_in_eur > 0 ? 'Our all-in fee is EUR ' + c.buyer_all_in_eur + '.' : 'Do not quote an amount for our fee; offer that a colleague sends the exact figure.'} Always label cost figures as indicative. Keep answers under 80 words. End with a natural next step only when it helps (a viewing, a call, a related question), not every time. Reply ONLY with JSON: {"reply":"...","suggestions":["two or three short follow-up questions the visitor might ask next"],"handoff":false}. Set handoff true when the visitor wants a viewing, negotiation, or anything only a person can do.`;
      const hist = Array.isArray(body.history) ? body.history.slice(-6).map((h: any) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '').slice(0, 800) })) : [];
      const t = await claude(sys, [...hist, { role: 'user', content: query }], 900);
      out = parseJson(t);
    } else {
      return json({ error: 'unknown mode' }, 400);
    }
  } catch (e) {
    ok = false;
    out = { reply: lang === 'nl' ? 'Even geen verbinding met onze assistent. App of bel ons gerust, we reageren snel.' : 'Our assistant is briefly unavailable. Feel free to WhatsApp or call us, we reply quickly.', error: String(e).slice(0, 200) };
  }
  await sb.from('web_assistant_log').insert({ ip_hash: ipHash, mode, lang, query, wp_id: wpId, result: out, ms: Date.now() - t0, ok });
  const { error: _e, ...pub } = out;
  return json(pub, ok ? 200 : 503);
});
