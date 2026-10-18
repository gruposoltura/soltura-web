// SOLTURA WEBSITE POC - Claude-assistent voor bezoekers.
// mode=search : natuurlijke taal -> filters + korte reactie, OF een lokale vraag over onze plaatsen (intent 'local')
// mode=ask    : vraag over een specifieke woning, gegrond in web_properties + web_property_geo
// POST {mode, lang, query, id?, reference?, wp_id?, history?}  of  GET ?mode=&lang=&q=&id=&ref=&wp_id=
// v13 (18-10-2026): lokale antwoorden korter; afstanden alleen uit de tabel; geen routes/buslijnen; geen ongevraagde diensten.
// v12 (18-10-2026): search-mode via tool use (altijd geldige JSON, geen afgekapte replies) en typische afstanden per plaats
//   (gemiddelden uit web_property_geo) als grond voor strand/vliegveld-vragen.
// v11 (18-10-2026): lokale vragen binnen ons werkgebied (weekmarkt, stranden, zorg, golf, praktische zaken).
//   Gegrond in web_town_info (geverifieerde plaatsfeiten met bron). Intent 'local' geeft filters=null terug,
//   plus town + cta zodat de site een knop "onze woningen in <plaats>" kan tonen. Buiten ons gebied of
//   onderwerpvreemd (code, recepten, politiek): vriendelijk terug naar wonen in de Vega Baja.
// v10 (18-10-2026): status (beschikbaar/onder bod/gereserveerd/verkocht) in de feiten.
// v9 (18-10-2026, NEXUS): woning op core-uuid (id) of referentie; wp_id alleen nog als terugval (nieuwe woningen hebben er geen).
// De Anthropic-key wordt server-side gelezen (nooit naar de browser).
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

let FACETS: { towns: string[]; cats: string[]; counts: Record<string, number>; at: number } | null = null;
async function facets() {
  if (FACETS && Date.now() - FACETS.at < 3600_000) return FACETS;
  const { data } = await sb.from('web_properties').select('town,category');
  const counts: Record<string, number> = {};
  (data || []).forEach((d: any) => { if (d.town) counts[d.town] = (counts[d.town] || 0) + 1; });
  const towns = Object.keys(counts).sort();
  const cats = [...new Set((data || []).map((d: any) => d.category).filter(Boolean))].sort();
  FACETS = { towns, cats, counts, at: Date.now() };
  return FACETS;
}
// Geverifieerde plaatsfeiten (weekmarkten e.d.), met betrouwbaarheid. Bron: web_town_info.
let TOWNINFO: { at: number; v: any[] } | null = null;
async function townInfo() {
  if (TOWNINFO && Date.now() - TOWNINFO.at < 600_000) return TOWNINFO.v;
  const { data } = await sb.from('web_town_info').select('town,place,topic,fact,confidence').eq('active', true).order('town');
  TOWNINFO = { at: Date.now(), v: data || [] };
  return TOWNINFO.v;
}
// Typische afstanden per plaats (gemiddelde over onze woningen daar, uit web_property_geo).
let TOWNGEO: { at: number; v: string } | null = null;
async function townGeo() {
  if (TOWNGEO && Date.now() - TOWNGEO.at < 3600_000) return TOWNGEO.v;
  const [{ data: ps }, { data: gs }] = await Promise.all([
    sb.from('web_properties').select('id,town'),
    sb.from('web_property_geo').select('id,alc_km,alc_drive_min,rmu_km,rmu_drive_min,beach_name,beach_road_km,beach_drive_min'),
  ]);
  const town = new Map((ps || []).map((p: any) => [p.id, p.town]));
  const agg: Record<string, any> = {};
  (gs || []).forEach((g: any) => {
    const t = town.get(g.id); if (!t) return;
    const a = (agg[t] ||= { n: 0, alc_km: 0, alc_min: 0, rmu_km: 0, rmu_min: 0, b_km: 0, b_min: 0, beaches: {} as Record<string, number> });
    a.n++; a.alc_km += +g.alc_km || 0; a.alc_min += +g.alc_drive_min || 0; a.rmu_km += +g.rmu_km || 0; a.rmu_min += +g.rmu_drive_min || 0;
    a.b_km += +g.beach_road_km || 0; a.b_min += +g.beach_drive_min || 0; if (g.beach_name) a.beaches[g.beach_name] = (a.beaches[g.beach_name] || 0) + 1;
  });
  const r = (x: number) => Math.round(x);
  const v = Object.entries(agg).filter(([, a]: any) => a.n >= 2).map(([t, a]: any) => {
    const beach = Object.entries(a.beaches as Record<string, number>).sort((x, y) => y[1] - x[1])[0]?.[0];
    return `- ${t}: nearest beach usually ${beach} (about ${Math.round(a.b_km / a.n * 10) / 10} km, ${r(a.b_min / a.n)} min by car); Alicante airport about ${r(a.alc_km / a.n)} km, ${r(a.alc_min / a.n)} min; Murcia airport about ${r(a.rmu_km / a.n)} km, ${r(a.rmu_min / a.n)} min`;
  }).join('\n');
  TOWNGEO = { at: Date.now(), v };
  return v;
}
// Gestructureerd antwoord via tool use: altijd geldige JSON, nooit meer afgekapte replies.
async function claudeTool(system: string, messages: { role: string; content: string }[], schema: any, max = 900) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': await key(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: max, system, messages, tools: [{ name: 'respond', description: 'Send the answer to the visitor.', input_schema: schema }], tool_choice: { type: 'tool', name: 'respond' } }),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  const tu = (j.content || []).find((c: any) => c.type === 'tool_use');
  if (!tu) throw new Error('no tool_use');
  return tu.input;
}
const SEARCH_SCHEMA = {
  type: 'object',
  properties: {
    intent: { type: 'string', enum: ['search', 'local', 'off_topic'] },
    filters: {
      type: ['object', 'null'],
      properties: {
        towns: { type: 'array', items: { type: 'string' } }, categories: { type: 'array', items: { type: 'string' } },
        price_min: { type: ['number', 'null'] }, price_max: { type: ['number', 'null'] }, beds_min: { type: ['number', 'null'] }, baths_min: { type: ['number', 'null'] },
        pool: { type: ['string', 'null'], enum: ['private', 'communal', 'any', null] }, newbuild: { type: ['boolean', 'null'] }, max_sea_km: { type: ['number', 'null'] },
        reduced_only: { type: 'boolean' }, sort: { type: ['string', 'null'], enum: ['price_asc', 'price_desc', 'newest', 'value', null] },
      },
    },
    reply: { type: 'string' },
    town: { type: ['string', 'null'] },
    cta: { type: ['string', 'null'] },
  },
  required: ['intent', 'filters', 'reply', 'town', 'cta'],
};
// Vandaag in Spanje, zodat "is er vandaag markt?" klopt.
function todayES() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const t0 = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'x';
  const ipHash = await sha(ip);
  let body: any = {};
  if (req.method === 'GET') {
    const u = new URL(req.url);
    body = { mode: u.searchParams.get('mode'), lang: u.searchParams.get('lang'), query: u.searchParams.get('q'), id: u.searchParams.get('id'), reference: u.searchParams.get('ref'), wp_id: u.searchParams.get('wp_id') };
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
      const [f, ti, tg] = await Promise.all([facets(), townInfo(), townGeo()]);
      const localFacts = ti.map((r: any) => `- ${r.town}${r.place ? ' / ' + r.place : ''} [${r.topic}, confidence ${r.confidence}]: ${r.fact}`).join('\n');
      const townCounts = f.towns.map((t) => `${t} (${f.counts[t]})`).join(', ');
      const sys = `${VOICE}
Today in Spain it is ${todayES()}.

The visitor types into the search box on our homepage. Decide first what kind of message it is:

1. intent "search": the visitor describes a home they want (type, budget, bedrooms, town, pool, sea...). Turn the wish into search filters for our listings and write one or two short sentences back that show you understood and add one useful local insight if relevant.

2. intent "local": a question about living in or visiting one of the towns where we sell homes, or the Vega Baja / Costa Blanca South around them. For example: on which day is the weekly market, which beach is closest, where is the health centre, golf, schools, supermarkets, fiestas, the climate, getting there from Alicante or Murcia airport, buses, practical matters for newcomers (NIE, padrón, healthcare, residency, opening a bank account) in general terms. Answer it like a helpful local who lives there, in at most 60 words (two to four short sentences). Rules for local answers:
   - Our towns (with the number of homes we have there now): ${townCounts}. Ciudad Quesada, Doña Pepa and La Marquesa belong to Rojales; La Zenia, Playa Flamenca, Cabo Roig and Campoamor to Orihuela Costa; La Marina to San Fulgencio; La Mata to Torrevieja. Nearby places in the Vega Baja and the Costa Blanca South (Alicante, Elche, Murcia, Cartagena, the airports) count too, as long as the question is about life around our towns.
   - Our verified local facts come first. Use them exactly. Confidence high: state it plainly. Medium: state it, optionally add "as far as we know". Low: give it, but say it is worth a quick check at the town hall (ayuntamiento) or tourist office.
${localFacts}
   - Typical distances from our homes in each town (averages, measured by us; use these instead of guessing, rounded):
${tg}
   - Exact days, opening hours, phone numbers, prices or dates that are NOT in the verified facts: never invent them. Give what you reliably know in general terms and say where to check (ayuntamiento, tourist office, the town's website), or offer that we check it for them. Stable general knowledge (where a beach is, what a town is like) is fine.
   - Distances and travel times: only from the table above, rounded, and never contradict it. No route directions, road numbers or bus lines.
   - If you are not sure a facility (health centre, school, station, hospital) exists in that exact town, say what is nearby in general terms and offer to check it for them.
   - Never offer services nobody asked for (airport pickup, car rental, bookings). The only offers you make: more about the area, showing our homes there, or checking a detail for them.
   - End with one short, natural bridge to living there, only when it fits, for example that we have homes in that town. Never pushy.
   - Set "town" to the one town from our list the question is mainly about (exact spelling from the list), else null. Set "cta" to a short button label in the reply language, like "Bekijk onze woningen in Rojales" / "See our homes in Rojales", only when town is set; else null.

3. intent "off_topic": anything not about homes or about life around our towns (programming, recipes, homework, politics, other countries or regions of Spain far from us). Reply in one or two friendly sentences that this is not something we help with here, and that we are happy to tell them about homes and life on the Costa Blanca South. No filters, town null.

Answer with the respond tool. The reply is plain text: no markdown, no asterisks, no bullet lists. For intent "local" and "off_topic" set "filters" to null. For intent "search" set "town" and "cta" to null.
Filter rules (intent "search" only): towns must come from this list (pick nearby towns if the visitor names an area: 'Quesada' or 'La Marquesa' -> Rojales; 'near the beach' -> Guardamar del Segura, Torrevieja, Orihuela Costa, La Manga del Mar Menor, Los Alcázares, San Fulgencio): ${f.towns.join(', ')}. categories from: ${f.cats.join(', ')}. pool: "private"|"communal"|"any"|null. newbuild: true|false|null. sort: "price_asc"|"price_desc"|"newest"|"value"|null ('value' = best price vs market). Prices in euro as numbers. Leave unknown fields null/empty; prefer towns over max_sea_km for beach wishes. A message that only names a town or street is a search. Never refuse a search; if the wish is vague, return broad filters and ask one short follow-up in the reply.
${LANG}`;
      const hist = Array.isArray(body.history) ? body.history.slice(-4).map((h: any) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '').slice(0, 600) })) : [];
      out = await claudeTool(sys, [...hist, { role: 'user', content: query }], SEARCH_SCHEMA, 900);
      if (typeof out.reply === 'string') out.reply = out.reply.replace(/\*\*?/g, '').trim();
      // Server-side bewaken: een lokale of onderwerpvreemde vraag mag de zoekfilters op de site nooit wijzigen.
      const intent = ['search', 'local', 'off_topic'].includes(out.intent) ? out.intent : (out.filters ? 'search' : 'local');
      out.intent = intent;
      if (intent !== 'search') out.filters = null;
      if (!out.town || !f.towns.includes(out.town) || intent !== 'local') { out.town = null; out.cta = null; }
      if (out.town && !out.cta) out.cta = (lang === 'nl' ? 'Bekijk onze woningen in ' : 'See our homes in ') + out.town;
    } else if (mode === 'ask') {
      const uuid = /^[0-9a-f-]{36}$/i.test(String(body.id || '')) ? String(body.id) : null;
      const ref = String(body.reference || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20) || null;
      let q = sb.from('web_properties').select('*');
      if (uuid) q = q.eq('id', uuid); else if (ref) q = q.ilike('reference', ref); else q = q.eq('wp_id', Number(body.wp_id) || 0);
      const { data: rows } = await q.limit(1);
      const p: any = rows && rows[0];
      if (!p) return json({ error: 'not found' }, 404);
      wpId = p.wp_id || null;
      const { data: g } = await sb.from('web_property_geo').select('*').eq('id', p.id).maybeSingle();
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
        solarium: p.solarium, aircon: p.aircon, status: p.status || (p.under_offer ? 'under_offer' : 'available'),
        price_vs_market_pct: p.is_newbuild ? null : p.market_deviation_pct, market_median_eur_m2: p.is_newbuild ? null : p.market_median_m2,
        description: strip(lang === 'nl' ? (p.body_nl || p.body_en) : (p.body_en || p.body_nl)).slice(0, 3500),
      };
      // Lokale feiten van de plaats van deze woning (bijv. de weekmarkt), zodat ook die vragen goed gaan.
      const ti = await townInfo();
      const near = ti.filter((r: any) => r.town === p.town).map((r: any) => `- ${r.town}${r.place ? ' / ' + r.place : ''} [confidence ${r.confidence}]: ${r.fact}`).join('\n');
      const sys = `${VOICE}\n${LANG}\nToday in Spain it is ${todayES()}.\nThe visitor is looking at this home of ours right now. What we know about it (use it, but never mention that it comes from a list or data):\n${JSON.stringify(facts)}\n${near ? 'Verified local facts about ' + p.town + ' (use exactly; for low confidence suggest a quick check at the town hall):\n' + near + '\n' : ''}The visitor may also ask about life around this home (markets, beaches, shops, healthcare, golf, getting around). Answer those like a helpful local; never invent exact days, opening hours, phone numbers or prices that are not given above, say where to check instead or offer that we check it. Questions that have nothing to do with this home or the area: one friendly sentence that we stick to homes and life here.\nDistances: use nearest_beach and airports. When measured_from is the centre of a town or area, say "from the centre of <place>" naturally. Purchase costs in the Comunidad Valenciana (current rates, use exactly these): resale ${c.itp_resale_pct}% transfer tax (ITP); new build ${c.iva_newbuild_pct}% VAT (IVA) plus ${c.ajd_newbuild_pct}% stamp duty (AJD); Calculate the tax for this home when asked. Important: Grupo Soltura does not work a la carte. Our service is ONE all-in fee, agreed up front. Never list or estimate separate costs for notary, land registry, lawyer/legal fees, NIE or power of attorney, not even for comparison. Explain that what comes on top of price and tax depends on the buyer's situation (do they still need an NIE / tax number, will they sign via a power of attorney, do they take a Spanish mortgage) and encourage them to ask us for a personal cost overview (offer it, and set handoff true when they want it). ${c.buyer_all_in_eur > 0 ? 'Our all-in fee is EUR ' + c.buyer_all_in_eur + '.' : 'Do not quote an amount for our fee.'} Always label cost figures as indicative. Status: 'available' = for sale; 'under_offer' = there is an offer, not yet signed, viewings and offers are still possible; 'reserved' = reserved by a buyer, offer to let them know if it comes back and to show similar homes; 'sold' = sold, say so plainly and offer to find something similar. Mention the status only when it is not 'available' or when asked. Keep answers under 80 words. End with a natural next step only when it helps (a viewing, a call, a related question), not every time. Reply ONLY with JSON: {"reply":"...","suggestions":["two or three short follow-up questions the visitor might ask next, in the same language as the reply"],"handoff":false}. Set handoff true when the visitor wants a viewing, negotiation, or anything only a person can do.`;
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
