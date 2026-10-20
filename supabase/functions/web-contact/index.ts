// SOLTURA WEBSITE - contact/bezichtiging/kostenoverzicht/waardebepaling/emigratie/nieuwsbrief/koopgids/favorieten.
// v4 (NEXUS intake, 17-10-2026): slaat de VOLLEDIGE formulier-body op (payload, form_id, page_url, utm, voor-/achternaam)
// in public.web_contact_requests en meldt de rij direct aan JARVIS-Sales-WebFormIntake-v2 (n8n webhook jarvis-web-intake-v2).
// Die zet hem via nexus2_submit_form als contact + request in core en stuurt de opvolg-agents aan.
// Is de intake niet bereikbaar: het vangnet pakt de rij later op.
// Koopgids: alleen als de intake NIET bereikbaar was, stuurt deze functie hem zelf door naar PurchaseInfo en zet guide_forwarded=true.
// v5/v6 (18-10-2026): interne melding via secret BREVO_API_KEY, anders via n8n-relay JARVIS-Infra-WebContactNotify-v2.
// v7 (18-10-2026): beschrijvende form_id per ingang (web-property-viewing, web-sell-valuation, ...; lijst in core.request_forms).
//   Oude technische ID's (viewForm, nl-form, ...) uit een gecachte pagina worden omgezet. Melding noemt de leesbare formuliernaam; geen "POC" meer.
// v8 (18-10-2026): kind 'favorites' (paneel "Stuur jezelf je favorieten", form_id web-favorites-mail).
//   - taal = browsertaal van de bezoeker (lang wordt niet meer naar nl/en platgeslagen voor favorieten);
//   - favorites = referenties (max 30), komen in payload; intake -> core request 'favorite' -> JARVIS-Sales-FavoritesMail;
//   - dry_run=true (site: #/favorites?test=1): NIETS opslaan, rechtstreeks naar FavoritesMail met dry_run -> mail alleen naar rick@;
//   - limiet: max 5 favorietenmails per e-mailadres per uur.
// v9 (19-10-2026): Zweedse website (/sv/). Besluit Rick: de site is Zweeds, alle uitgaande communicatie (mail, mailings, berichten)
//   blijft ENGELS. Daarom wordt taal 'sv' (sitetaal of browsertaal) altijd 'en' voor het contact en voor FavoritesMail.
//   De sitetaal blijft zichtbaar in payload.site_lang / payload.lang en in page_url (/sv/...).
// v10 (20-10-2026): kind 'notify' (knop "Laat me weten als hij terugkomt" op gereserveerde woning, form_id web-property-notify).
//   E-mail verplicht (de opvolging is een mail). Intake legt hem vast als request type notify-back; geen LeadProcessor.
//   JARVIS-Sales-BackOnMarket mailt zodra de woning weer beschikbaar is.
import { createClient } from 'jsr:@supabase/supabase-js@2';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const NOTIFY_HOOK = 'https://gruposoltura.app.n8n.cloud/webhook/web-contact-notify-v2';
const TO = 'rick@gruposoltura.com';
const GUIDE_HOOK = 'https://gruposoltura.app.n8n.cloud/webhook/jarvis-purchase-info';
const INTAKE_HOOK = 'https://gruposoltura.app.n8n.cloud/webhook/jarvis-web-intake-v2';
const FAV_HOOK = 'https://gruposoltura.app.n8n.cloud/webhook/jarvis-favorites-mail';
const INTERESTS = ['market_report', 'monthly_matches', 'price_reduced', 'weekly_news'];
const LANGS = ['nl', 'en', 'es', 'de', 'fr', 'no', 'da', 'fi', 'ru'];
// talen waarin de site wel bestaat maar waarin we NIET communiceren -> Engels
const COMM_EN = ['sv'];
// terugval per soort als de pagina geen form_id meestuurt
const FORM_BY_KIND: Record<string, string> = { viewing: 'web-property-viewing', guide: 'web-property-buying-guide', costs: 'web-buy-costs', valuation: 'web-sell-valuation', move: 'web-move-intake', contact: 'web-contact', newsletter: 'web-newsletter-footer', favorites: 'web-favorites-mail', notify: 'web-property-notify' };
// oude technische element-ID's (pagina van voor v7 nog in cache)
const LEGACY_ID: Record<string, string> = { viewForm: 'web-property-viewing', guideForm: 'web-property-buying-guide', buyForm: 'web-buy-costs', sellForm: 'web-sell-valuation', moveForm: 'web-move-intake', contactForm: 'web-contact' };
const NL_VARIANT: Record<string, string> = { pop: 'web-newsletter-popup', feed: 'web-newsletter-feed', inline: 'web-newsletter-footer' };
const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]!));
const str = (v: unknown, n: number) => String(v ?? '').slice(0, n);
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
function formId(b: any, kind: string) {
  let id = str(b.form_id, 60).trim();
  if (id === 'nl-form') id = NL_VARIANT[str(b.nl_variant, 10)] || FORM_BY_KIND.newsletter;
  if (LEGACY_ID[id]) id = LEGACY_ID[id];
  // oude pagina: kostenvraag via het bezichtigingsformulier op een woning
  if (id === 'web-property-viewing' && kind === 'costs') id = 'web-property-costs';
  return id || FORM_BY_KIND[kind] || null;
}
// payload: alles wat de site meestuurde, begrensd (geen honeypot, geen geneste reuzen)
function cleanPayload(b: any) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(b || {})) {
    if (k === 'website' || Object.keys(out).length >= 60) continue;
    if (typeof v === 'string') out[k.slice(0, 60)] = v.slice(0, 3000);
    else if (typeof v === 'number' || typeof v === 'boolean' || v === null) out[k.slice(0, 60)] = v;
    else { const j = JSON.stringify(v); if (j && j.length <= 4000) out[k.slice(0, 60)] = v; }
  }
  return out;
}
let FORMS: Record<string, string> | null = null;
async function formLabel(id: string | null) {
  if (!id) return '';
  if (!FORMS) {
    try { const { data } = await sb.rpc('nexus2_request_forms'); FORMS = Object.fromEntries((data || []).map((f: any) => [f.key, f.nl])); }
    catch { FORMS = {}; }
  }
  return FORMS![id] || id;
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  let b: any = {};
  try { b = await req.json(); } catch { return new Response('bad', { status: 400, headers: CORS }); }
  if (b.website) return new Response('{"ok":true}', { headers: CORS }); // honeypot
  const interests = Array.isArray(b.interests) ? b.interests.map(String).filter((x: string) => INTERESTS.includes(x)) : [];
  const kind = str(b.kind || 'contact', 30);
  const isFav = kind === 'favorites';
  const favorites: string[] = isFav && Array.isArray(b.favorites)
    ? [...new Set(b.favorites.map((x: unknown) => str(x, 64).trim()).filter(Boolean))].slice(0, 30) as string[] : [];
  if (isFav) b.favorites = favorites;
  const siteLang = str(b.site_lang || b.lang, 10).toLowerCase().slice(0, 2);
  // Zweedse site of Zweedse browser: communicatie in het Engels
  const rawBrowser = str(b.browser_lang || b.lang, 10).toLowerCase().slice(0, 2);
  const browserLang = COMM_EN.includes(rawBrowser) || COMM_EN.includes(siteLang) ? 'en' : rawBrowser;
  const utm = b.utm && typeof b.utm === 'object' && !Array.isArray(b.utm) ? b.utm : null;
  const row = {
    kind, lang: isFav ? (LANGS.includes(browserLang) ? browserLang : 'en') : (b.lang === 'nl' ? 'nl' : 'en'),
    name: str(b.name || [b.first || b.first_name, b.last || b.last_name].filter(Boolean).join(' '), 120), email: str(b.email, 160).trim(), phone: str(b.phone, 40),
    message: isFav ? `Favorieten (${favorites.length}): ${favorites.join(', ')}` : str(b.message, 3000),
    wp_id: Number(b.wp_id) || null, reference: str(b.reference, 20) || null, vid: str(b.vid, 64),
    interests: interests.length ? interests : null,
    form_id: formId(b, kind),
    first_name: str(b.first || b.first_name, 60).trim() || null, last_name: str(b.last || b.last_name, 60).trim() || null,
    page_url: str(b.page_url || b.page, 300) || null, utm, payload: cleanPayload(b),
  };
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email);
  if (!emailOk && (row.kind === 'newsletter' || row.kind === 'guide' || row.kind === 'notify' || isFav || row.phone.length < 6)) return json({ ok: false, error: 'contact' }, 400);
  if (row.kind === 'newsletter' && !interests.length) return json({ ok: false, error: 'interests' }, 400);
  if (isFav && !favorites.length) return json({ ok: false, error: 'favorites' }, 400);

  // Favorieten - testmodus: niets opslaan, rechtstreeks naar FavoritesMail (die stuurt alleen naar rick@).
  if (isFav && (b.dry_run === true || b.dry_run === 'true' || b.dry_run === 1)) {
    let ok = false;
    try {
      const r = await fetch(FAV_HOOK, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        email: row.email, first_name: row.first_name || '', last_name: row.last_name || '', browser_lang: browserLang, favorites,
        dry_run: true, page_url: row.page_url, source: 'website-test' }), signal: AbortSignal.timeout(8000) });
      ok = r.ok;
    } catch { ok = false; }
    return json({ ok, test: true });
  }
  // Favorieten - limiet tegen misbruik: max 5 per e-mailadres per uur.
  if (isFav) {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await sb.from('web_contact_requests').select('id', { count: 'exact', head: true }).eq('kind', 'favorites').ilike('email', row.email).gte('at', since);
    if ((count || 0) >= 5) return json({ ok: false, error: 'rate' }, 429);
  }

  const { data: ins } = await sb.from('web_contact_requests').insert(row).select('id').single();
  // 1. intake aanmelden (realtime). 404/timeout -> vangnet pakt het later op.
  let intakeOk = false;
  if (ins) {
    try {
      const r = await fetch(INTAKE_HOOK, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: ins.id }), signal: AbortSignal.timeout(4000) });
      intakeOk = r.ok;
    } catch { intakeOk = false; }
  }
  // 2. koopgids: alleen zelf doorsturen als de intake niet bereikbaar was (anders doet de intake het)
  let forwarded: boolean | null = null;
  if (row.kind === 'guide' && !intakeOk) {
    try {
      const r = await fetch(GUIDE_HOOK, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        email: row.email, name: row.name, first_name: row.first_name || '', last_name: row.last_name || '', phone: row.phone,
        kind: 'buying_guide', lang: row.lang, request_type: 'request-purchaseinfo', message: '', source: 'website-new', reference: row.reference,
      }), signal: AbortSignal.timeout(8000) });
      forwarded = r.ok;
    } catch { forwarded = false; }
  }
  // 3. interne melding (rick@)
  const label = await formLabel(row.form_id);
  let mailed = false;
  const html = `<p><b>${esc(label || row.kind)}</b>${row.reference ? ' - ' + esc(row.reference) : ''}</p><p>${esc(row.name)}<br>${esc(row.email)}<br>${esc(row.phone)}<br>Taal: ${row.lang}${siteLang && siteLang !== row.lang ? ' (website: ' + esc(siteLang) + ')' : ''}</p>${interests.length ? `<p>Interesses: ${interests.join(', ')}</p>` : ''}${forwarded !== null ? `<p>Koopgids rechtstreeks doorgezet naar PurchaseInfo: ${forwarded ? 'ja' : 'MISLUKT'}</p>` : ''}<p>JARVIS-intake: ${intakeOk ? 'aangemeld' : 'niet bereikbaar (vangnet volgt)'}</p><p>${esc(row.message).replace(/\n/g, '<br>')}</p>${row.page_url ? `<p style="color:#888">${esc(row.page_url)}</p>` : ''}`;
  const subject = `[Website] ${label || row.kind}${row.reference ? ' ' + row.reference : ''} - ${row.name || row.email}`;
  const key = (Deno.env.get('BREVO_API_KEY') || '').trim();
  if (key) {
    try {
      const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST', headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: { name: 'Soltura website', email: 'noreply@gruposoltura.com' }, to: [{ email: TO }], replyTo: row.email ? { email: row.email, name: row.name || row.email } : undefined, subject, htmlContent: html }),
        signal: AbortSignal.timeout(8000),
      });
      mailed = r.ok;
      if (!r.ok) console.error('MAIL_ERR brevo ' + r.status + ': ' + (await r.text()).slice(0, 400));
    } catch (e) { console.error('MAIL_ERR brevo ' + String((e as Error)?.message || e)); }
  }
  if (!mailed) {
    try {
      const r = await fetch(NOTIFY_HOOK, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: ins?.id ?? null, subject, html, replyTo: row.email || '', replyName: row.name || '' }), signal: AbortSignal.timeout(10000) });
      const j = await r.json().catch(() => ({}));
      mailed = r.ok && j?.ok === true;
      if (!mailed) console.error('MAIL_ERR relay ' + r.status + ': ' + JSON.stringify(j).slice(0, 300));
    } catch (e) { console.error('MAIL_ERR relay ' + String((e as Error)?.message || e)); }
  }
  if (ins) await sb.from('web_contact_requests').update({ mailed, intake_notified: intakeOk, guide_forwarded: forwarded === true ? true : null }).eq('id', ins.id);
  return json({ ok: true, forwarded });
});
