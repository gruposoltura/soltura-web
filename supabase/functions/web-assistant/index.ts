// SOLTURA WEBSITE - live assistent "Sola" voor bezoekers.
// mode=search : natuurlijke taal -> filters + korte reactie, OF een lokale vraag over onze plaatsen (intent 'local')
// mode=ask    : vraag over een specifieke woning, gegrond in web_properties + web_property_geo
// mode=relax  : bij nul treffers de alternatieven van de site verwerken in één antwoord
// mode=guide  : gesprek op de woon/koopgids-pagina (na de intake): koop- en verkoopproces, kosten, gebieden, emigreren,
//               gegrond in web_guide_knowledge + web_town_info; kan ook onze woningen zoeken (max 3 kaartjes terug)
// POST {mode, lang, query, id?, reference?, wp_id?, history?, name?}  of  GET ?mode=&lang=&q=&id=&ref=&wp_id=
// v29 (27-10-2026): taal hard (Rick zag 'Rojales is a good choice ... Wat zoekt u precies'): de server herkent de taal van de
//   bezoeker (woordlijsten NL/EN/ES/SV/DE/FR, bij twijfel de eerdere berichten) en zegt die expliciet; search en relax leggen
//   eerst reply_language vast vóór de reply. Nooit twee talen in één antwoord, Nederlands altijd je/jij.
// v26 (27-10-2026): search onthoudt het gesprek (Rick): de site stuurt de gesprekshistorie (sessie) en de huidige zoekstand
//   (state: filters + aantal treffers) mee. Een vervolgbericht ("doe maar 3 slaapkamers") verfijnt de lopende zoekvraag;
//   alleen een duidelijk nieuwe zoekvraag (new_search) of een expliciet losgelaten wens (cleared) wist eerdere filters.
//   Server-side samenvoegen als vangnet. pool alleen als de bezoeker een zwembad noemt. relax kent het gesprek en vraagt
//   bij een botsing of de eerdere wens nog geldt ("Zoek je nog steeds in Benijófar? Daar heb ik met 3 slaapkamers niets.").
//   Plaatsnamen worden accent-ongevoelig op de plaatslijst gezet, gangbaarste schrijfwijze (Benijofar -> Benijófar).
// v25 (26-10-2026): Spaanse website (/es/): lang 'es' als terugvaltaal (Spaans van Spanje, tú), Spaanse knopteksten en
//   foutmeldingen, Spaanse omschrijving (body_es, terugval body_en) als die er is. Overige talen ongewijzigd.
// v24 (24-10-2026): web_guide_knowledge is de ene kennisbron voor alle modi: ook search en ask lezen de gids
//   (hypotheek + documenten, proces, NIE e.d.). Kennis toevoegen = rij in web_guide_knowledge, nooit in deze code.
//   search: algemene koop/hypotheekvragen lopen via intent 'local' (filters null, town null) - geen frontend-wijziging nodig.
// v23 (23-10-2026): de assistent heet Sola (vrouwelijk), niet meer Ava.
// v22 (23-10-2026): commerciële naam Soltura Real Estate (niet Grupo Soltura) naar bezoekers.
// v21 (23-10-2026): de assistent heet Ava (vrouwelijk), niet meer Sol.
// v20 (23-10-2026): search - afstanden in het lokale inzicht alleen uit de tabel (Benijófar stond op '5 km van Alicante').
// v19 (23-10-2026): guide - alleen gevraagde zoekvelden, max 90 woorden, eigendomsregister != kadaster.
// v18 (23-10-2026): de assistent heet Sol ("Hoi, ik ben Sol, jouw live assistent"); mode=guide; status 'under_offer'
//   = gereserveerd: bezichtigingen gestopt (besluit Rick 18-10-2026), seintje "Terug in aanbod" + vergelijkbare woningen.
// v17 (23-10-2026): relax - knoplabels per soort (place/type/change/budget) trouw vertaald.
// v16 (23-10-2026): relax - geen plaatsinfo op alternatieve plaatsen overdragen; tip helderder.
// v15 (23-10-2026): mode=relax - bij nul treffers verwerkt de assistent de alternatieven (andere plaatsen, type, of een budgetvoorstel)
//   in zijn eigen antwoord en vertaalt de knopteksten, alles in de taal van de bezoeker. Telt en kiest niets zelf: de site levert de alternatieven.
// v14 (19-10-2026): Zweedse website (/sv/): lang 'sv' als terugvaltaal, Zweedse knopteksten en foutmeldingen, Zweedse omschrijving (body_sv) als die er is.
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

const VOICE = `Your name is Sola. You are the live assistant of Soltura Real Estate (the company is legally Grupo Soltura SL, but to visitors we are always Soltura Real Estate; never call us Grupo Soltura): the real estate agency in Formentera del Segura, between Rojales and Guardamar on the Costa Blanca South, local since 2002 and always one step ahead. Your colleagues are Rick, Marco, Ingrid and Lisette. You speak as one of us.

About yourself: when you introduce yourself or someone asks who they are talking to, you are Sola, the live assistant of Soltura Real Estate. You present yourself as female (she/her; in Dutch, German, Spanish or Swedish use the feminine forms where the language needs them). Be honest that you are a digital assistant when asked; never pretend to be a person. For anything important (a viewing, an offer, a personal cost overview) a colleague takes over personally. Do not repeat your name in every answer.

How we talk:
- Always in the "we" form for the company: "we", "our", "this villa of ours", "we know this area well". Never refer to "the listing", "the data", "the description", "the information provided" or "the facts I have". You know these homes and this area; speak from that knowledge with quiet authority.
- Warm, direct and confident, like an experienced local agent talking to a client. Short sentences. No hype, no exclamation marks, no filler.
- Dutch: informal "je/jij", natural Dutch, never a literal translation of English phrasing.
- Swedish: informal "du", natural Swedish, never a literal translation of English phrasing.
- Spanish: Spanish from Spain (es-ES), informal "tú", natural Spanish, never a literal translation of English phrasing.
- Give concrete numbers (km, minutes, euros, m²) whenever you have them, rounded sensibly ("about 7 km, roughly a quarter of an hour by car").
- Never say you cannot answer or that something is unknown in a distant way. If a detail is genuinely not known to us yet (for example community fees or the exact year of a renovation), say it the way an agent would: "That is something we will check for you with the owner." and offer to arrange it. Do not invent such details.
- You may use general, stable local knowledge about the Vega Baja and Costa Blanca South (towns, beaches, golf courses, airports, healthcare, supermarkets, the climate, the AP-7 and CV-905), but never invent facts about a specific home.
- Purchase costs are always indicative; we give the exact figure before anything is signed.
- Our team speaks Dutch, English, German and Spanish. Never promise a colleague who speaks another language.`;

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
  const v: Record<string, number> = { itp_resale_pct: 9, iva_newbuild_pct: 10, ajd_newbuild_pct: 1.4 };
  (data || []).forEach((r: any) => (v[r.key] = Number(r.value)));
  CFG = { at: Date.now(), v };
  return v;
}
const strip = (h?: string | null) => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

let FACETS: { towns: string[]; cats: string[]; counts: Record<string, number>; market: string; at: number } | null = null;
async function facets() {
  if (FACETS && Date.now() - FACETS.at < 3600_000) return FACETS;
  const { data } = await sb.from('web_properties').select('town,category,price,is_newbuild,status');
  const counts: Record<string, number> = {};
  const byCat: Record<string, number[]> = {};
  (data || []).forEach((d: any) => {
    if (d.town) counts[d.town] = (counts[d.town] || 0) + 1;
    if (d.category && d.price > 0 && d.status !== 'under_offer') (byCat[d.category] ||= []).push(Number(d.price));
  });
  const towns = Object.keys(counts).sort();
  const cats = [...new Set((data || []).map((d: any) => d.category).filter(Boolean))].sort();
  const k = (n: number) => Math.round(n / 1000) * 1000;
  const market = Object.entries(byCat).sort((a, b) => b[1].length - a[1].length).map(([c, ps]) => {
    ps.sort((a, b) => a - b);
    return `${c}: ${ps.length} for sale, from about EUR ${k(ps[0])} to EUR ${k(ps[ps.length - 1])}, half below EUR ${k(ps[Math.floor(ps.length / 2)])}`;
  }).join('; ');
  FACETS = { towns, cats, counts, market, at: Date.now() };
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
// Kennis uit de woon/koopgids (web_guide_knowledge); {itp} e.d. komen uit web_config.
// Sinds v24 de ene kennisbron voor ALLE modi (search, ask, guide).
let GUIDE: { at: number; v: string } | null = null;
async function guideKnowledge() {
  if (GUIDE && Date.now() - GUIDE.at < 600_000) return GUIDE.v;
  const [{ data }, c] = await Promise.all([sb.from('web_guide_knowledge').select('key,part,title,body').eq('active', true).order('sort'), cfg()]);
  const fill = (s: string) => s.replace(/\{itp\}/g, String(c.itp_resale_pct)).replace(/\{iva\}/g, String(c.iva_newbuild_pct))
    .replace(/\{ajd\}/g, String(c.ajd_newbuild_pct)).replace(/\{euribor\}/g, String(Math.round((c.euribor_12m_pct || 0) * 100) / 100));
  const v = (data || []).map((r: any) => `[${r.key}] ${r.part} - ${r.title}: ${fill(r.body)}`).join('\n\n');
  GUIDE = { at: Date.now(), v };
  return v;
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
    reply_language: { type: 'string', description: 'The language the visitor writes in; the whole reply is in this language.' },
    new_search: { type: 'boolean' },
    cleared: { type: 'array', items: { type: 'string', enum: ['towns', 'categories', 'price_min', 'price_max', 'beds_min', 'baths_min', 'pool', 'newbuild', 'max_sea_km', 'reduced_only', 'sort'] } },
    reply: { type: 'string' },
    town: { type: ['string', 'null'] },
    cta: { type: ['string', 'null'] },
  },
  required: ['intent', 'filters', 'reply_language', 'new_search', 'cleared', 'reply', 'town', 'cta'],
};
// Zoekstand van de site (filters die nu actief zijn) netjes inlezen; alleen bekende velden.
const FKEYS = ['towns', 'categories', 'price_min', 'price_max', 'beds_min', 'baths_min', 'pool', 'newbuild', 'max_sea_km', 'reduced_only', 'sort'];
const isEmpty = (v: any) => v == null || v === false || v === '' || (Array.isArray(v) && !v.length);
function readState(st: any, towns: string[], cats: string[]) {
  if (!st || typeof st !== 'object' || !st.filters || typeof st.filters !== 'object') return null;
  const f: any = {};
  for (const k of FKEYS) {
    let v = st.filters[k];
    if (k === 'towns') v = (Array.isArray(v) ? v : []).filter((t: any) => towns.includes(t));
    else if (k === 'categories') v = (Array.isArray(v) ? v : []).map((c: any) => String(c).toLowerCase()).filter((c: string) => cats.includes(c));
    else if (k === 'pool') v = ['private', 'communal', 'any'].includes(v) ? v : null;
    else if (k === 'sort') v = ['price_asc', 'price_desc', 'newest', 'value'].includes(v) ? v : null;
    else if (k === 'newbuild' || k === 'reduced_only') v = v === true ? true : (k === 'newbuild' && v === false ? false : (k === 'reduced_only' ? false : null));
    else v = Number(v) > 0 ? Number(v) : null;
    f[k] = v;
  }
  if (FKEYS.every((k) => isEmpty(f[k]))) return null;
  return { filters: f, n: Number.isFinite(Number(st.n)) ? Number(st.n) : null };
}
function describeState(f: any) {
  const p: string[] = [];
  if (f.towns?.length) p.push('towns: ' + f.towns.join(', '));
  if (f.categories?.length) p.push('types: ' + f.categories.join(', '));
  if (f.price_min) p.push('from EUR ' + f.price_min);
  if (f.price_max) p.push('up to EUR ' + f.price_max);
  if (f.beds_min) p.push('at least ' + f.beds_min + ' bedrooms');
  if (f.baths_min) p.push('at least ' + f.baths_min + ' bathrooms');
  if (f.pool) p.push('pool: ' + f.pool);
  if (f.newbuild === true) p.push('new build only'); else if (f.newbuild === false) p.push('resale only');
  if (f.max_sea_km) p.push('within ' + f.max_sea_km + ' km of the sea');
  if (f.reduced_only) p.push('price-reduced only');
  return p.join('; ');
}
// Gesprekshistorie: user/assistant afwisselend, begint met user, laatste n beurten.
function cleanHist(h: any, n: number, len: number) {
  const a = (Array.isArray(h) ? h : []).map((x: any) => ({ role: x && x.role === 'assistant' ? 'assistant' : 'user', content: String((x && x.content) || '').slice(0, len).trim() })).filter((x: any) => x.content);
  const out: { role: string; content: string }[] = [];
  for (const m of a) { if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += '\n' + m.content; else out.push(m); }
  let r = out.slice(-n);
  while (r.length && r[0].role !== 'user') r = r.slice(1);
  if (r.length && r[r.length - 1].role === 'user') r = r.slice(0, -1); // laatste beurt moet van ons zijn; de nieuwe vraag volgt
  return r;
}
const POOL_WORD = /zwembad|pool|piscin|bassäng|bassang|schwimm|piscine|basen/i;
// Taal van de bezoeker herkennen aan typische woorden; null bij twijfel (dan beslist het model).
const LANG_WORDS: Record<string, string[]> = {
  Dutch: ['ik', 'zoek', 'zoeken', 'een', 'het', 'met', 'voor', 'naar', 'wat', 'hoe', 'mag', 'maar', 'doe', 'graag', 'niet', 'ook', 'slaapkamers', 'slaapkamer', 'zwembad', 'huis', 'woning', 'woningen', 'tot', 'bij', 'van', 'iets', 'heb', 'wil', 'kan', 'dichtbij', 'buurt', 'nieuwbouw', 'vrijstaand', 'geen', 'waar', 'wanneer', 'hebben', 'jullie', 'liever', 'zijn', 'wij', 'dan', 'nog', 'welke', 'goedkoper'],
  English: ['i', 'am', "i'm", 'looking', 'for', 'a', 'an', 'the', 'with', 'and', 'to', 'house', 'home', 'homes', 'bedrooms', 'bedroom', 'near', 'beach', 'want', 'need', 'something', 'under', 'what', 'how', 'cheap', 'cheaper', 'build', 'any', 'show', 'me', 'please', 'have', 'you', 'do', 'where', 'which', 'rather', 'also', 'but'],
  Spanish: ['busco', 'una', 'un', 'casa', 'con', 'y', 'para', 'piscina', 'dormitorios', 'habitaciones', 'cerca', 'playa', 'quiero', 'algo', 'hasta', 'qué', 'que', 'cómo', 'vivienda', 'piso', 'el', 'la', 'los', 'las', 'tenéis', 'tienes', 'hay', 'dónde', 'mejor', 'también', 'por'],
  Swedish: ['jag', 'söker', 'letar', 'efter', 'ett', 'med', 'och', 'hus', 'bostad', 'bostäder', 'sovrum', 'nära', 'stranden', 'vill', 'något', 'till', 'för', 'har', 'ni', 'finns', 'billigare', 'också', 'var', 'hur'],
  German: ['ich', 'suche', 'ein', 'eine', 'mit', 'und', 'haus', 'wohnung', 'schlafzimmer', 'strand', 'nähe', 'bis', 'etwas', 'möchte', 'haben', 'sie', 'gibt', 'auch', 'oder', 'nicht'],
  French: ['je', 'cherche', 'une', 'avec', 'maison', 'chambres', 'plage', 'près', 'jusqu', 'quelque', 'chose', 'vous', 'avez', 'pour', 'et', 'où'],
};
function detectLang(text: string): string | null {
  const toks = String(text || '').toLowerCase().match(/[\p{L}']+/gu) || [];
  const score: Record<string, number> = {};
  for (const [l, ws] of Object.entries(LANG_WORDS)) score[l] = toks.filter((t) => ws.includes(t)).length;
  const r = Object.entries(score).sort((a, b) => b[1] - a[1]);
  return r[0][1] >= 1 && r[0][1] > r[1][1] ? r[0][0] : null;
}
const REGISTER: Record<string, string> = { Dutch: 'Dutch (informal je/jij, never u)', Swedish: 'Swedish (informal du)', Spanish: 'Spanish from Spain (informal tú)', German: 'German', French: 'French', English: 'English' };
const RELAX_SCHEMA = {
  type: 'object',
  properties: {
    reply_language: { type: 'string', description: 'The language the visitor writes in; reply, labels and tip are all in this language.' },
    reply: { type: 'string' },
    labels: { type: 'array', items: { type: 'string' } },
    try_label: { type: ['string', 'null'] },
    tip: { type: ['string', 'null'] },
  },
  required: ['reply_language', 'reply', 'labels', 'try_label', 'tip'],
};
const GUIDE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    suggestions: { type: 'array', items: { type: 'string' } },
    search: {
      type: ['object', 'null'],
      properties: {
        towns: { type: 'array', items: { type: 'string' } }, categories: { type: 'array', items: { type: 'string' } },
        price_min: { type: ['number', 'null'] }, price_max: { type: ['number', 'null'] }, beds_min: { type: ['number', 'null'] },
        pool: { type: ['string', 'null'], enum: ['private', 'communal', 'any', null] }, newbuild: { type: ['boolean', 'null'] },
      },
    },
    link: { type: ['string', 'null'], enum: ['buy', 'sell', 'move', 'costs', 'area', 'contact', null] },
    handoff: { type: 'boolean' },
  },
  required: ['reply', 'suggestions', 'search', 'link', 'handoff'],
};
// Vandaag in Spanje, zodat "is er vandaag markt?" klopt.
function todayES() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}
// Woningen zoeken voor het gidsgesprek (max 3, eigen woningen en nieuwste eerst; gereserveerde niet).
function homeFilter(q: any, s: any, towns: string[]) {
  const tw = (Array.isArray(s.towns) ? s.towns : []).filter((t: string) => towns.includes(t));
  if (tw.length) q = q.in('town', tw);
  const cats = (Array.isArray(s.categories) ? s.categories : []).map((c: string) => String(c).toLowerCase()).slice(0, 6);
  if (cats.length) q = q.in('category', cats);
  if (Number(s.price_min) > 0) q = q.gte('price', Number(s.price_min));
  if (Number(s.price_max) > 0) q = q.lte('price', Number(s.price_max));
  if (Number(s.beds_min) > 0) q = q.gte('bedrooms', Number(s.beds_min));
  if (s.pool === 'private') q = q.eq('pool_private', true);
  if (s.pool === 'communal') q = q.eq('pool_communal', true);
  if (s.newbuild === true || s.newbuild === false) q = q.eq('is_newbuild', s.newbuild);
  return q;
}
async function findHomes(s: any, towns: string[]) {
  const q = homeFilter(sb.from('web_properties')
    .select('id,reference,category,town,suburb,price,price_from,bedrooms,bathrooms,build_area,pool_private,pool_communal,is_newbuild,image,status')
    .neq('status', 'under_offer'), s, towns);
  const { data } = await q.order('is_own', { ascending: false }).order('list_date', { ascending: false, nullsFirst: false }).limit(3);
  return data || [];
}
async function countHomes(s: any, towns: string[]) {
  const { count } = await homeFilter(sb.from('web_properties').select('id', { count: 'exact', head: true }).neq('status', 'under_offer'), s, towns);
  return count || 0;
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
  const lang = body.lang === 'nl' || body.lang === 'sv' || body.lang === 'es' ? body.lang : 'en';
  const tx = (o: Record<string, string>) => o[lang] ?? o.en;
  const query = String(body.query || '').slice(0, 500);
  // Taal: altijd de taal waarin de bezoeker schrijft; de paginataal is alleen de terugval.
  if (!query) return json({ error: 'empty' }, 400);
  // Taal hard vastleggen: eerst de vraag zelf, bij twijfel de eerdere berichten van de bezoeker.
  const prevUser = (Array.isArray(body.history) ? body.history : []).filter((h: any) => h && h.role !== 'assistant').map((h: any) => String(h.content || '')).slice(-4).join(' ');
  const vlang = detectLang(query) || (prevUser ? detectLang(prevUser) : null);
  const LANGX = vlang ? `\nTHE VISITOR WRITES IN ${vlang.toUpperCase()}. Write the WHOLE reply, every sentence, and all suggestions, labels and tips in ${REGISTER[vlang]} only. Never mix languages and never start in another language, whatever the language of the website or of this prompt.` : '\nNever mix languages within one answer: every sentence in the same language.';
  const LANG = `Always reply in the language the visitor writes in (Dutch, English, Spanish, German, French, Swedish, Norwegian, Polish or any other), also when the website is set to another language. Only when the message gives no clear language, reply in ${tx({ en: 'English', nl: 'Dutch', sv: 'Swedish', es: 'Spanish (Spain, informal tú)' })}. Suggestions use the same language as your reply.` + LANGX;

  // eenvoudige rate limit: 40 vragen per uur per (gehasht) IP
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from('web_assistant_log').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('at', since);
  if ((count || 0) > 40) return json({ reply: tx({ en: 'You have asked a lot of questions. Feel free to call or WhatsApp us and we will help you personally.', nl: 'Je hebt veel vragen gesteld. Bel of app ons gerust, dan helpen we je persoonlijk verder.', sv: 'Du har ställt många frågor. Ring eller skicka ett WhatsApp till oss, så hjälper vi dig personligen.', es: 'Has hecho muchas preguntas. Llámanos o escríbenos por WhatsApp y te ayudamos personalmente.' }) }, 429);

  let out: any = {}, ok = true, wpId: number | null = null;
  try {
    if (mode === 'search') {
      const [f, ti, tg, gk] = await Promise.all([facets(), townInfo(), townGeo(), guideKnowledge()]);
      const localFacts = ti.map((r: any) => `- ${r.town}${r.place ? ' / ' + r.place : ''} [${r.topic}, confidence ${r.confidence}]: ${r.fact}`).join('\n');
      const townCounts = f.towns.map((t) => `${t} (${f.counts[t]})`).join(', ');
      const state = readState(body.state, f.towns, f.cats);
      const stateTxt = state
        ? `The search currently shown on the site (built from this conversation and any filters the visitor set by hand): ${describeState(state.filters)}.${state.n != null ? ` That shows ${state.n} home(s) now.` : ''}`
        : 'There is no active search yet.';
      const sys = `${VOICE}
Today in Spain it is ${todayES()}.

The visitor types into the search box on our homepage. Decide first what kind of message it is:

1. intent "search": the visitor describes a home they want (type, budget, bedrooms, town, pool, sea...). Turn the wish into search filters for our listings and write one or two short sentences back that show you understood and add one useful local insight if relevant. Any distance or travel time in that insight must come from the typical distances table below (rounded); if it is not in the table, leave distances out.

2. intent "local": a question about living in or visiting one of the towns where we sell homes, or the Vega Baja / Costa Blanca South around them. For example: on which day is the weekly market, which beach is closest, where is the health centre, golf, schools, supermarkets, fiestas, the climate, getting there from Alicante or Murcia airport, buses, practical matters for newcomers (NIE, padrón, healthcare, residency, opening a bank account) in general terms. A question about who you are also counts as local: introduce yourself as Sola in one sentence. Answer it like a helpful local who lives there, in at most 60 words (two to four short sentences). Rules for local answers:
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
   - Set "town" to the one town from our list the question is mainly about (exact spelling from the list), else null. Set "cta" to a short button label in the reply language, like "Bekijk onze woningen in Rojales" / "See our homes in Rojales" / "Se våra bostäder i Rojales" / "Ver nuestras viviendas en Rojales", only when town is set; else null.

   Also intent "local": a general question about buying, selling or moving here (the purchase process, costs and taxes, mortgages and the documents a bank needs, NIE, bank account, power of attorney, legal checks, new build, renting out, life after the purchase). Answer from OUR GUIDE below: it is our own knowledge and the source of truth for these topics; never contradict it and never mention a knowledge base. Concrete, in at most 90 words; a list of documents may be named in full in one or two plain sentences. Taxes and legal points: the general rule, figures indicative, and we confirm it for their situation. Prices of our services (buyer guidance, mortgage mediation, commission) are never mentioned: they are on request. When they want something personal (a cost overview, a mortgage in principle, a call), say a colleague gladly helps. For these questions set "town" and "cta" to null.

OUR GUIDE:
${gk}

3. intent "off_topic": anything not about homes, buying or selling here, or life around our towns (programming, recipes, homework, politics, other countries or regions of Spain far from us). Reply in one or two friendly sentences that this is not something we help with here, and that we are happy to tell them about homes and life on the Costa Blanca South. No filters, town null.

Answer with the respond tool. The reply is plain text: no markdown, no asterisks, no bullet lists. For intent "local" and "off_topic" set "filters" to null. For intent "search" set "town" and "cta" to null.
Filter rules (intent "search" only): towns must come from this list (pick nearby towns if the visitor names an area: 'Quesada' or 'La Marquesa' -> Rojales; 'near the beach' -> Guardamar del Segura, Torrevieja, Orihuela Costa, La Manga del Mar Menor, Los Alcázares, San Fulgencio): ${f.towns.join(', ')}. categories from: ${f.cats.join(', ')}. pool: "private"|"communal"|"any"|null. newbuild: true|false|null. sort: "price_asc"|"price_desc"|"newest"|"value"|null ('value' = best price vs market). Prices in euro as numbers. Leave unknown fields null/empty; prefer towns over max_sea_km for beach wishes. A message that only names a town or street is a search. Never refuse a search; if the wish is vague, return broad filters and ask one short follow-up in the reply. Set pool ONLY when the visitor mentions a pool; otherwise null.

THE CONVERSATION (this is a conversation, not a series of separate searches):
${stateTxt}
- Remember what the visitor told you earlier in this conversation (town, budget, type, bedrooms, pool...). A follow-up like "3 bedrooms then", "a bit cheaper", "with a pool", "doe maar 3 slaapkamers" or an answer to your own question REFINES the current search: return the COMPLETE filters = everything still wanted from before plus the change. Never drop an earlier wish just because the new message does not repeat it. new_search false, cleared [].
- Only when the visitor clearly lets go of an earlier wish ("other towns are fine too", "any type", "forget the budget", "doesn't have to be Benijófar") put that field name in "cleared" and leave it out of the filters.
- Only when the visitor clearly starts a different search (a new town instead of the old one, "now something completely different", a different kind of home with a new budget) set new_search true and give just the new filters. A new town that REPLACES the old one ("rather in Rojales") is a change of towns, not a new search: keep the other wishes.
- In the reply, show you understood the whole wish in one natural sentence (for example "Three bedrooms in Benijófar, here is what we have."). Do not repeat earlier local insights.
- For intent "local" and "off_topic" the current search stays as it is; new_search false, cleared [].
${LANG}`;
      const hist = cleanHist(body.history, 10, 600);
      out = await claudeTool(sys, [...hist, { role: 'user', content: query }], SEARCH_SCHEMA, 900);
      if (typeof out.reply === 'string') out.reply = out.reply.replace(/\*\*?/g, '').trim();
      // Server-side bewaken: een lokale of onderwerpvreemde vraag mag de zoekfilters op de site nooit wijzigen.
      const intent = ['search', 'local', 'off_topic'].includes(out.intent) ? out.intent : (out.filters ? 'search' : 'local');
      out.intent = intent;
      if (intent !== 'search') out.filters = null;
      // Vangnet gespreksgeheugen: eerdere wensen blijven staan tenzij het een nieuwe zoekvraag is of de wens expliciet is losgelaten.
      if (intent === 'search' && out.filters && typeof out.filters === 'object') {
        const nf: any = { ...out.filters };
        // plaatsnamen exact zoals op de site (Benijofar -> Benijófar), anders vindt de site niets
        const fold = (x: any) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        if (Array.isArray(nf.towns)) nf.towns = [...new Set(nf.towns.map((t: any) => f.towns.filter((x) => fold(x) === fold(t)).sort((a, b) => (f.counts[b] || 0) - (f.counts[a] || 0))[0]).filter(Boolean))];
        const cleared = new Set(Array.isArray(out.cleared) ? out.cleared.filter((k: any) => FKEYS.includes(k)) : []);
        const kept: string[] = [];
        if (state && out.new_search !== true) {
          for (const k of FKEYS) if (isEmpty(nf[k]) && !cleared.has(k) && !isEmpty(state.filters[k])) { nf[k] = state.filters[k]; kept.push(k); }
        }
        // zwembad alleen als de bezoeker er (nu of eerder) om vroeg
        if (nf.pool && !POOL_WORD.test(query) && nf.pool !== (state && out.new_search !== true ? state.filters.pool : null)) nf.pool = state && out.new_search !== true ? state.filters.pool : null;
        out.filters = nf;
        out.context = { had_state: !!state, new_search: out.new_search === true, cleared: [...cleared], kept };
      }
      delete out.new_search; delete out.cleared; delete out.reply_language;
      if (!out.town || !f.towns.includes(out.town) || intent !== 'local') { out.town = null; out.cta = null; }
      if (out.town && !out.cta) out.cta = tx({ en: 'See our homes in ', nl: 'Bekijk onze woningen in ', sv: 'Se våra bostäder i ', es: 'Ver nuestras viviendas en ' }) + out.town;
    } else if (mode === 'relax') {
      // De site vond niets dat precies past en geeft alternatieven mee (al geteld en gekozen). Wij maken er één antwoord van.
      const alts = Array.isArray(body.alts) ? body.alts.slice(0, 6).map((a: any) => ({ desc: String(a.desc || '').slice(0, 200), n: Number(a.n) || 0 })) : [];
      if (!alts.length) return json({ error: 'no alts' }, 400);
      const applied = !!body.applied;
      const prev = String(body.reply || '').slice(0, 1200);
      const rhist = cleanHist(body.history, 10, 400);
      const convo = rhist.length ? rhist.map((h) => (h.role === 'user' ? 'Visitor: ' : 'Us: ') + h.content).join('\n') : '';
      const sys = `${VOICE}
${LANG}
The language of the visitor is the language of THEIR search message (not of our earlier reply, not of the website). Write everything in that language.
The visitor searched our homes, we already gave a short first reply, and then we found that nothing matches the wish exactly.
Rewrite our first reply into ONE reply (plain text, no markdown, at most 75 words):
- Keep what was good in the first reply (understanding the wish, the local insight). Drop a follow-up question if it no longer fits.
- Then, naturally and warmly, say that exactly this we do not have right now, and add the alternative:
${applied
  ? '  - The FIRST alternative below is already being shown underneath. Say what it is and how many homes, with the exact numbers and place names given (correct singular/plural). The other alternatives are buttons the visitor can choose; you may mention briefly that there are other options below, without listing them.'
  : '  - Within the budget we have nothing that fits, not even with a small change. The ONLY alternative is a higher maximum budget. Ask the visitor, as a question, whether they would like to raise their budget to that amount, and say how many homes we then have. Do NOT say it has been done: the visitor decides with the button. Format the amount like "€ 450.000" (Dutch style) or "€450,000" (English style) to fit the language.'}
- Never invent homes, numbers, places or prices other than those given. Never present a budget increase as done.
- If the wish was built up over several messages (see the conversation below), the newest wish may clash with an earlier one. Then name that clearly and ask whether the earlier wish still holds, in the visitor's language, for example: "In Benijófar we have nothing with 3 bedrooms right now. Are you still looking in Benijófar, or may it be nearby?" Keep the place and the newest wish together in that sentence.
- Say nothing about the alternative places themselves (no distances, beaches, character, not even that they are near or next to another town): the local insight from the first reply belongs to the town the visitor asked for only. Never carry it over to another place.
Also give:
- labels: a short button label for EACH alternative, same order, same count (${alts.length}), in the visitor's language, at most 6 words, without the number of homes (we show the count ourselves). Each alternative starts with its kind (place, type, change, budget): translate its meaning faithfully. place: just "In <places>". budget: "Yes, show homes up to <amount>". Only a budget alternative may mention an amount; never turn another alternative into a budget label.
- try_label: ${applied ? 'a short lead-in for the other buttons, like "Or adjust your wish another way:" in the visitor\'s language; null if there is only one alternative.' : 'null.'}
- tip: one short sentence in the visitor's language: ${applied ? 'a tip that a price range, a town or area and the type of home give the best results.' : 'that they can also ask us to search for them, because many homes are offered to people registered with us before they go online.'}
Answer with the respond tool.`;
      const msg = `${convo ? 'Conversation so far:\n' + convo + '\n\n' : ''}Visitor's search message: ${query}\nOur first reply: ${prev}\nAlternatives (in order):\n${alts.map((a: any, i: number) => `${i + 1}. ${a.desc} -> ${a.n} home(s)`).join('\n')}`;
      out = await claudeTool(sys, [{ role: 'user', content: msg }], RELAX_SCHEMA, 700);
      if (typeof out.reply === 'string') out.reply = out.reply.replace(/\*\*?/g, '').trim();
      if (!Array.isArray(out.labels) || out.labels.length !== alts.length) out.labels = null;
      delete out.reply_language;
    } else if (mode === 'guide') {
      // Gidspagina: de bezoeker heeft (meestal) net de woon/koopgids aangevraagd en praat door met Sola.
      const [f, ti, tg, gk] = await Promise.all([facets(), townInfo(), townGeo(), guideKnowledge()]);
      const name = String(body.name || '').replace(/[^\p{L}\p{M}' -]/gu, '').trim().slice(0, 40);
      const localFacts = ti.map((r: any) => `- ${r.town}${r.place ? ' / ' + r.place : ''} [${r.topic}, confidence ${r.confidence}]: ${r.fact}`).join('\n');
      const townCounts = f.towns.map((t) => `${t} (${f.counts[t]})`).join(', ');
      const sys = `${VOICE}
${LANG}
Today in Spain it is ${todayES()}.
You are chatting on the page of our free living and buying guide "At home on the Costa Blanca".${name ? ` The visitor is called ${name} and has just requested the guide; it is on its way to their inbox. Use the first name now and then, not in every answer.` : ''}
You know the whole content of the guide (below) and can talk about: buying and selling in Spain in all its steps, costs and taxes, mortgages, NIE, power of attorney, legal checks, new build, renting out, the viewing trip, life after the purchase, moving here with a family, our region and towns, and our homes for sale.

THE GUIDE (our own knowledge, use it as the source of truth; never mention "the knowledge base"; refer to "our guide" or "in the guide, part 5" naturally when it helps):
${gk}

OUR HOMES NOW: towns with the number of homes we have there: ${townCounts}. Types and price spread right now: ${f.market}.
To show homes: fill "search" (towns exactly from the town list, categories from: ${f.cats.join(', ')}, prices in euro, pool private|communal|any, newbuild true|false). Only set a field the visitor actually asked for; leave everything else null or empty (for example newbuild stays null unless they say new build or resale). We then show up to three matching homes under your answer, with the total count; say something like "here are a few that fit" without inventing details about them. Only fill "search" when the visitor wants to see homes or describes a home; otherwise null.

VERIFIED LOCAL FACTS (use exactly; low confidence: suggest a quick check at the town hall):
${localFacts}
TYPICAL DISTANCES from our homes per town (use, rounded, never contradict):
${tg}

Rules:
- Plain text, no markdown, no lists, at most 90 words (keep to this, summarise long processes in their main steps). Answer the question first, concretely, then at most one natural next step.
- Terms: the land registry (Registro de la Propiedad, Dutch: eigendomsregister / het register) is not the cadastre (Catastro, Dutch: kadaster); never mix them up.
- Prices of our services (buyer guidance, mortgage mediation, Modelo 210, wills, commission) are never mentioned: they are on request; set link "contact" when the visitor wants them.
- New-build projects: before any project information (prices, plans, brochures, payment schedules) we want personal contact and preferably a visit to the project; ask for their availability to come to Spain and set handoff true.
- Taxes and legal points: give the general rule from the guide, label figures as indicative, and say we confirm it for their situation. Never give personal tax or legal advice beyond that.
- When the visitor wants a viewing, a call, a personal cost overview or anything only a person can do: set handoff true and say a colleague (Rick, Marco, Ingrid or Lisette) will contact them.
- link: the one page of our website that helps most with this answer, or null: buy (Buying), sell (Selling), move (Move to Spain), costs (monthly costs calculator), area (town guides), contact.
- Off-topic questions (not about homes, buying, selling or life here): one friendly sentence and steer back.
- suggestions: two or three short follow-up questions the visitor might ask next, in the visitor's language, each under 8 words, picking guide topics they have not asked about yet.
Answer with the respond tool.`;
      const hist = Array.isArray(body.history) ? body.history.slice(-8).map((h: any) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '').slice(0, 800) })) : [];
      out = await claudeTool(sys, [...hist, { role: 'user', content: query }], GUIDE_SCHEMA, 1000);
      if (typeof out.reply === 'string') out.reply = out.reply.replace(/\*\*?/g, '').trim();
      if (!Array.isArray(out.suggestions)) out.suggestions = [];
      out.suggestions = out.suggestions.slice(0, 3).map((s: any) => String(s).slice(0, 80));
      if (!['buy', 'sell', 'move', 'costs', 'area', 'contact'].includes(out.link)) out.link = null;
      out.handoff = out.handoff === true;
      if (out.search && typeof out.search === 'object') {
        const [homes, n] = await Promise.all([findHomes(out.search, f.towns), countHomes(out.search, f.towns)]);
        out.homes = homes; out.total = n;
      } else { out.search = null; out.homes = []; out.total = 0; }
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
        description: strip(lang === 'nl' ? (p.body_nl || p.body_en) : lang === 'sv' ? (p.body_sv || p.body_en || p.body_nl) : lang === 'es' ? (p.body_es || p.body_en || p.body_nl) : (p.body_en || p.body_nl)).slice(0, 3500),
      };
      // Lokale feiten van de plaats van deze woning (bijv. de weekmarkt), zodat ook die vragen goed gaan.
      const [ti, gk] = await Promise.all([townInfo(), guideKnowledge()]);
      const near = ti.filter((r: any) => r.town === p.town).map((r: any) => `- ${r.town}${r.place ? ' / ' + r.place : ''} [confidence ${r.confidence}]: ${r.fact}`).join('\n');
      const guideBlock = gk ? `General buying questions (the purchase process, mortgages and the documents a bank needs, NIE, bank account, power of attorney, legal checks, new build, renting out, life after the purchase): answer from OUR GUIDE below, applied to this home where it fits. It is our own knowledge and the source of truth for these topics; never contradict it and never mention a knowledge base. A list of documents may be named in full (up to 100 words for that answer). Prices of our services (buyer guidance, mortgage mediation, commission) are never mentioned: they are on request. Terms: the land registry (Registro de la Propiedad) is not the cadastre (Catastro).\nOUR GUIDE:\n${gk}\n` : '';
      const sys = `${VOICE}\n${LANG}\nToday in Spain it is ${todayES()}.\nThe visitor is looking at this home of ours right now. What we know about it (use it, but never mention that it comes from a list or data):\n${JSON.stringify(facts)}\n${near ? 'Verified local facts about ' + p.town + ' (use exactly; for low confidence suggest a quick check at the town hall):\n' + near + '\n' : ''}${guideBlock}The visitor may also ask about life around this home (markets, beaches, shops, healthcare, golf, getting around). Answer those like a helpful local; never invent exact days, opening hours, phone numbers or prices that are not given above, say where to check instead or offer that we check it. Questions that have nothing to do with this home, buying here or the area: one friendly sentence that we stick to homes and life here.\nDistances: use nearest_beach and airports. When measured_from is the centre of a town or area, say "from the centre of <place>" naturally. Purchase costs in the Comunidad Valenciana (current rates, use exactly these): resale ${c.itp_resale_pct}% transfer tax (ITP); new build ${c.iva_newbuild_pct}% VAT (IVA) plus ${c.ajd_newbuild_pct}% stamp duty (AJD); Calculate the tax for this home when asked. Important: Soltura Real Estate does not work a la carte. Our service is ONE all-in fee, agreed up front. Never list or estimate separate costs for notary, land registry, lawyer/legal fees, NIE or power of attorney, not even for comparison. Explain that what comes on top of price and tax depends on the buyer's situation (do they still need an NIE / tax number, will they sign via a power of attorney, do they take a Spanish mortgage) and encourage them to ask us for a personal cost overview (offer it, and set handoff true when they want it). ${c.buyer_all_in_eur > 0 ? 'Our all-in fee is EUR ' + c.buyer_all_in_eur + '.' : 'Do not quote an amount for our fee.'} Always label cost figures as indicative. New build: before sending any project information (prices lists, plans, brochures, payment schedules) we want personal contact and preferably a visit to the project; ask when they could come to Spain and set handoff true. Status: 'available' = for sale; 'under_offer' or 'reserved' = reserved by a buyer: we have stopped viewings and expect the sale to complete; if it falls through it comes back on the market, so offer to let them know (the "back on the market" button) and to show similar homes; 'sold' = sold, say so plainly and offer to find something similar. Mention the status only when it is not 'available' or when asked. Keep answers under 80 words. End with a natural next step only when it helps (a viewing, a call, a related question), not every time. Reply ONLY with JSON: {"reply":"...","suggestions":["two or three short follow-up questions the visitor might ask next, in the same language as the reply"],"handoff":false}. Set handoff true when the visitor wants a viewing, negotiation, or anything only a person can do.`;
      const hist = Array.isArray(body.history) ? body.history.slice(-6).map((h: any) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '').slice(0, 800) })) : [];
      const t = await claude(sys, [...hist, { role: 'user', content: query }], 900);
      out = parseJson(t);
    } else {
      return json({ error: 'unknown mode' }, 400);
    }
  } catch (e) {
    ok = false;
    out = { reply: tx({ en: 'Our assistant is briefly unavailable. Feel free to WhatsApp or call us, we reply quickly.', nl: 'Even geen verbinding met onze assistent. App of bel ons gerust, we reageren snel.', sv: 'Vår assistent är inte tillgänglig just nu. Skicka gärna ett WhatsApp eller ring oss, vi svarar snabbt.', es: 'Nuestra asistente no está disponible en este momento. Escríbenos por WhatsApp o llámanos, respondemos enseguida.' }), error: String(e).slice(0, 200) };
  }
  await sb.from('web_assistant_log').insert({ ip_hash: ipHash, mode, lang, query, wp_id: wpId, result: out, ms: Date.now() - t0, ok });
  const { error: _e, ...pub } = out;
  return json(pub, ok ? 200 : 503);
});
