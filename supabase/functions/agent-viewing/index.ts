// agent-viewing (24-10-2026, registratie en e-mailcode 28-10-2026 BD-169, makelaarsklant + behandelaar BD-170):
// makelaarsportaal op de website (agents.gruposoltura.com -> /en/agents/ · /nl/makelaars/ · /sv/maklare/ · /es/agentes/).
// Een samenwerkende makelaar vraagt in gesprek met Sola een bezichtiging aan: klant + bezichtigingsaanvraag in NEXUS via
// nexus2_submit_form (makelaar = aanbrenger), bevestiging aan de makelaar en interne melding aan de behandelaar
// (via n8n JARVIS-Sales-AgentPortalMail -> Brevo, afzender viewing@), regel in core.viewing_intake (menu Bezichtiging) en jarvis_runs.
// De klant van de makelaar krijgt label claimed (Client Claim System, nooit in een mailing) en als eigenaar de behandelaar:
// Lisette voor portaalleads, terugval de salesrep van de woning (rpc nexus2_agent_viewing_rep).
// Sinds 28-10-2026 is het portaal de enige route (de mailflow viewing@ is uit): een onbekende makelaar registreert zich via Sola.
// Client Claim System (BD-171): de makelaar geeft naam + e-mail tot en met '@'. Bestaat die klant al bij ons (of bij een andere
// makelaar), dan weigert Sola de aanvraag en krijgt Rick een Telegram-alarm met de gegevens van makelaar en klant. Is het de eigen
// klant van dezelfde makelaar, dan hangt de nieuwe aanvraag aan het bestaande contact (geen dubbel). Claim duurt 90 dagen.
// Opmaak van alle uitgaande mail: mail-shell.ts (huisstijlconventie, footer met API/GIPE/CEI/AIPP).
//
// Inloggen:  { action:'check', email, device? }  -> bekend + vertrouwd apparaat: { known, token, agent }
//                                                  -> bekend, nieuw apparaat: code per mail { known, code:true, cid, masked }
//                                                  -> onbekend: { known:false }
//            { action:'verify', cid, code, ua? }  -> { ok, token, device, agent, registered?, changes? }
// Registratie: { action:'reg_check', company, first_name, last_name, email, mobile }
//                                                  -> { status:'new'|'known', email_known, email_is_agent, same_contact, mobile_other, masked_other, diff:{company,name,mobile} }
//            { action:'reg_send', ...dezelfde velden, choice, note, lang } -> code naar het opgegeven e-mailadres { cid, masked }
//              choice: new | login (niets gewijzigd) | moved (ander kantoor) | name (andere naam) | mobile (nieuw nummer) | email (nieuw adres, nummer is van mij) | other
// Apparaat vergeten: { action:'forget', device }
// POST { action: 'property', token, ref }                 -> { found, available, ref, title, town, image, price, beds, url, has_keys, rep_first }
// POST { action: 'client_check', token, ref, client_first, client_last, client_local }
//                                                         -> { status:'free'|'own'|'known' }  (Client Claim System, BD-171)
// POST { action: 'submit', token, ref, client_first, client_last, client_local, day, time, lang, nonce, page_url, test }
//                                                         -> { ok, outcome, rep:{name,full_name,email,mobile}, has_keys, mails_sent }
// test=true (pagina met ?test=1): niets in NEXUS, alle mails alleen naar rick@ met [TEST], intake als dry-run.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { VM } from './viewing-mails.ts';
import { mailShell } from './mail-shell.ts';

const SB = Deno.env.get('SUPABASE_URL')!;
const SR = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SB, SR);
const TEST_EMAIL = 'rick@gruposoltura.com';
const SENDER = { name: 'Grupo Soltura · Viewings', email: 'viewing@gruposoltura.com' };
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'content-type': 'application/json', 'cache-control': 'no-store' } });
const str = (v: unknown, n = 120) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const EMAIL = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

// ---------- eenvoudige limiet per IP (per isolate): 8 e-mailcontroles per 10 min ----------
const hits = new Map<string, number[]>();
function limited(ip: string, max = 8, win = 600_000) {
  const now = Date.now(), a = (hits.get(ip) || []).filter((t) => now - t < win);
  a.push(now); hits.set(ip, a);
  if (hits.size > 5000) hits.delete(hits.keys().next().value!);
  return a.length > max;
}

// ---------- sessietoken: HMAC over e-mail|contact|vervaltijd, 6 uur geldig ----------
const enc = new TextEncoder();
let hkey: CryptoKey | null = null;
async function key() { return hkey ||= await crypto.subtle.importKey('raw', enc.encode('agent-portal:' + SR), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']); }
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function sign(email: string, cid: string) {
  const body = b64(enc.encode(JSON.stringify({ e: email, c: cid, x: Date.now() + 6 * 3600_000 })));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await key(), enc.encode(body)));
  return body + '.' + b64(sig);
}
async function verify(tok: unknown): Promise<{ e: string; c: string } | null> {
  try {
    const [body, sig] = String(tok || '').split('.');
    if (!body || !sig) return null;
    if (!(await crypto.subtle.verify('HMAC', await key(), unb64(sig), enc.encode(body)))) return null;
    const p = JSON.parse(new TextDecoder().decode(unb64(body)));
    return p && p.x > Date.now() ? p : null;
  } catch { return null; }
}

// referentie uit vrije tekst of een woning-URL: RH864, "rh 864", .../property/rh864-villa-rojales/
function parseRef(v: unknown) {
  const s = String(v || '');
  const m = s.match(/\/(?:property|woning|bostad|home)\/([a-z]{1,4}\d{2,6})/i) || s.match(/\b([a-z]{1,4})\s?-?\s?(\d{2,6})\b/i);
  if (!m) return '';
  return (m[2] ? m[1] + m[2] : m[1]).toUpperCase();
}

async function rpc(name: string, args: unknown) {
  const { data, error } = await sb.rpc(name, args as Record<string, unknown>);
  if (error) throw new Error(name + ': ' + error.message);
  return data;
}
async function agentOf(email: string) { return (await rpc('nexus2_agent_portal_lookup', { p_email: email })) || null; }
async function context(email: string, ref: string, dry: boolean) {
  let cx = await rpc('nexus2_viewing_context', { p_email: email, p_ref: ref || null, p_dry: dry });
  if (Array.isArray(cx)) cx = cx[0] || {};
  return cx || {};
}

// Mail gaat via n8n JARVIS-Sales-AgentPortalMail (Brevo-credential blijft in n8n; huisregel: uitgaande mail via Brevo, sleutel niet in de edge function).
const RELAY = 'https://gruposoltura.app.n8n.cloud/webhook/agent-portal-mail';
let relayKey = '';
async function sendMails(list: any[], test: boolean, ref: string, notify: unknown = null) {
  const mails = list.map((m) => ({ kind: m.kind, to: test ? TEST_EMAIL : m.to, toName: m.toName || '', replyTo: m.replyTo || SENDER.email,
    subject: test ? `[TEST → ${m.to}] ${m.subject}` : m.subject, html: m.html }));
  const fail = (e: string) => list.map((m) => ({ kind: m.kind, to: m.to, subject: m.subject, sent: false, error: e }));
  try {
    if (!relayKey) { const k = await sb.from('fn_keys').select('value').eq('name', 'agent-portal-mail').maybeSingle(); relayKey = (k.data && k.data.value) || ''; }
    const r = await fetch(RELAY, { method: 'POST', headers: { 'content-type': 'application/json', 'x-fn-key': relayKey }, body: JSON.stringify({ mails, ref, test, notify }), signal: AbortSignal.timeout(25000) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok || !Array.isArray(j.results)) return fail(`relay ${r.status}`);
    return list.map((m, i) => ({ kind: m.kind, to: m.to, subject: m.subject, sent: !!(j.results[i] && j.results[i].sent), error: j.results[i] ? j.results[i].error : 'geen resultaat' }));
  } catch (e) { return fail(String((e as Error)?.message || e).slice(0, 160)); }
}

// ---------- Client Claim System (BD-171) ----------
// De makelaar geeft alleen het deel tot en met '@'; daarmee checken we of de klant al bestaat zonder zijn adres te vragen.
function localOf(v: unknown) {
  return String(v ?? '').toLowerCase().replace(/\s+/g, '').split('@')[0].replace(/[^a-z0-9._%+-]/g, '').slice(0, 64);
}
function claimAlarm(ag: any, email: string, first: string, last: string, local: string, ref: string) {
  const body = '\u{1F6A8} <b>Deze klant is al bij ons bekend.</b> De bezichtigingsaanvraag is geweigerd.'
    + '\n\nKlant: <b>' + escH(((first || '') + ' ' + (last || '')).trim() || '-') + '</b>\nE-mail: ' + escH(local + '@')
    + '\nWoning: ' + escH(ref || '-')
    + '\n\nMakelaar: <b>' + escH(ag.name || '-') + '</b>' + (ag.company ? ' \u00b7 ' + escH(ag.company) : '')
    + '\nE-mail: ' + escH(email) + (ag.mobile ? '\nMobiel: ' + escH(ag.mobile) : '');
  return { source: 'AgentPortal', status: 'warn', title: '\u{1F6A8} Aanvraag geweigerd - klant al bekend', body };
}

// UTM op links naar de site (zelfde conventie als node "Pick Mails": utm_source=brevo, utm_medium=email, utm_campaign=viewing)
function utm(html: string) {
  return html.replace(/(href\s*=\s*)(["'])(https?:\/\/(?:www\.)?gruposoltura\.com(?:[\/?#][^"']*)?)\2/gi, (all, pre, q, url) => {
    if (/\/unsubscribe|privacy|privacidad|integritet|[?&]utm_/i.test(url)) return all;
    url = url.replace(/^https?:\/\/(?:www\.)?gruposoltura\.com/i, 'https://gruposoltura.com');
    const i = url.indexOf('#'); let base = i >= 0 ? url.slice(0, i) : url; const hash = i >= 0 ? url.slice(i) : '';
    if (/^https:\/\/gruposoltura\.com$/i.test(base)) base += '/';
    return pre + q + base + (base.includes('?') ? '&' : '?') + 'utm_source=brevo&utm_medium=email&utm_campaign=viewing&utm_content=footer' + hash + q;
  });
}

async function logRun(status: string, summary: string, stats: Record<string, unknown>) {
  try { await sb.from('jarvis_runs').insert({ workflow: 'AppointmentAgentV2', status, summary: summary.slice(0, 500), stats }); } catch (_e) { /* best effort */ }
}

// ---------- e-mailcode en vertrouwde apparaten (BD-169) ----------
const CODE_LANGS = ['en', 'nl', 'es', 'sv'];
const lang4 = (l: unknown) => { const s = String(l || '').slice(0, 2).toLowerCase(); return CODE_LANGS.includes(s) ? s : 'en'; };
async function sha(v: string) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode('agent-portal:' + SR + ':' + v)));
  return Array.from(d, (x) => x.toString(16).padStart(2, '0')).join('');
}
const mask = (e: string) => { const [a, d] = String(e || '').split('@'); return a && d ? a.charAt(0) + '***@' + d : ''; };
const digits = (v: unknown) => String(v ?? '').replace(/[^0-9]/g, '');
const normName = (v: unknown) => String(v ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
function newCode() { const a = new Uint32Array(1); crypto.getRandomValues(a); return String(100000 + (a[0] % 900000)); }
function randToken() { const a = new Uint8Array(32); crypto.getRandomValues(a); return b64(a); }

const RECEIVED: Record<string, string> = {
  nl: 'Je ontvangt deze e-mail omdat je inlogt of je registreert op het makelaarsportaal agents.gruposoltura.com.',
  en: 'You received this email because you are signing in or registering on the agent portal agents.gruposoltura.com.',
  es: 'Has recibido este correo porque inicias sesión o te registras en el portal de agentes agents.gruposoltura.com.',
  sv: 'Du får det här mejlet eftersom du loggar in eller registrerar dig på mäklarportalen agents.gruposoltura.com.',
};
const shell = (inner: string, lang: string) => mailShell(inner, lang, RECEIVED[lang] || RECEIVED.en);

const CM: Record<string, any> = {
  en: { s_login: 'Your sign-in code for the agent portal', s_reg: 'Confirm your registration as a partner agent', hi: (f: string) => f ? 'Hi ' + f + ',' : 'Hello,',
    p_login: 'Use this code to sign in to the Soltura Real Estate agent portal on this device:', p_reg: 'Use this code to confirm your registration as a partner agent of Soltura Real Estate:',
    valid: 'The code is valid for 15 minutes. Did you not request it? Then you can ignore this email.', sign: 'Kind regards,<br>Soltura Real Estate',
    s_welcome: 'Welcome as a partner agent of Soltura Real Estate', s_update: 'Your partner agent details have been updated',
    welcome: 'You are now registered as a partner agent. From now on you book viewings for your clients at <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a>: sign in with this email address and Sola, our live assistant, handles your request on the spot.',
    update: 'We have updated your partner agent details. You keep booking viewings at <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a> with this email address.',
    details: ['Name', 'Agency', 'Email', 'Mobile'], btn: 'Go to the agent portal' },
  nl: { s_login: 'Je inlogcode voor het makelaarsportaal', s_reg: 'Bevestig je registratie als samenwerkende makelaar', hi: (f: string) => f ? 'Hoi ' + f + ',' : 'Hallo,',
    p_login: 'Gebruik deze code om op dit apparaat in te loggen op het makelaarsportaal van Soltura Real Estate:', p_reg: 'Gebruik deze code om je registratie als samenwerkende makelaar van Soltura Real Estate te bevestigen:',
    valid: 'De code is 15 minuten geldig. Heb je hem niet aangevraagd? Dan kun je deze mail negeren.', sign: 'Met vriendelijke groet,<br>Soltura Real Estate',
    s_welcome: 'Welkom als samenwerkende makelaar van Soltura Real Estate', s_update: 'Je makelaarsgegevens zijn bijgewerkt',
    welcome: 'Je bent nu geregistreerd als samenwerkende makelaar. Bezichtigingen voor je klanten vraag je voortaan aan op <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a>: log in met dit e-mailadres en Sola, onze live assistent, handelt je aanvraag meteen af.',
    update: 'We hebben je makelaarsgegevens bijgewerkt. Je vraagt bezichtigingen gewoon aan op <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a> met dit e-mailadres.',
    details: ['Naam', 'Makelaardij', 'E-mail', 'Mobiel'], btn: 'Naar het makelaarsportaal' },
  es: { s_login: 'Tu código de acceso al portal de agentes', s_reg: 'Confirma tu registro como agente colaborador', hi: (f: string) => f ? 'Hola ' + f + ',' : 'Hola,',
    p_login: 'Usa este código para entrar en el portal de agentes de Soltura Real Estate en este dispositivo:', p_reg: 'Usa este código para confirmar tu registro como agente colaborador de Soltura Real Estate:',
    valid: 'El código es válido durante 15 minutos. ¿No lo has pedido? Puedes ignorar este correo.', sign: 'Un saludo,<br>Soltura Real Estate',
    s_welcome: 'Bienvenido/a como agente colaborador de Soltura Real Estate', s_update: 'Hemos actualizado tus datos de agente',
    welcome: 'Ya estás registrado/a como agente colaborador. A partir de ahora solicitas las visitas de tus clientes en <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a>: entra con este correo y Sola, nuestra asistente en directo, tramita tu solicitud al momento.',
    update: 'Hemos actualizado tus datos de agente. Sigues solicitando visitas en <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a> con este correo.',
    details: ['Nombre', 'Agencia', 'Correo', 'Móvil'], btn: 'Ir al portal de agentes' },
  sv: { s_login: 'Din inloggningskod till mäklarportalen', s_reg: 'Bekräfta din registrering som samarbetande mäklare', hi: (f: string) => f ? 'Hej ' + f + ',' : 'Hej,',
    p_login: 'Använd den här koden för att logga in på Soltura Real Estates mäklarportal på den här enheten:', p_reg: 'Använd den här koden för att bekräfta din registrering som samarbetande mäklare hos Soltura Real Estate:',
    valid: 'Koden gäller i 15 minuter. Har du inte begärt den? Då kan du ignorera det här mejlet.', sign: 'Vänliga hälsningar,<br>Soltura Real Estate',
    s_welcome: 'Välkommen som samarbetande mäklare hos Soltura Real Estate', s_update: 'Dina mäklaruppgifter har uppdaterats',
    welcome: 'Du är nu registrerad som samarbetande mäklare. Visningar för dina kunder bokar du från och med nu på <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a>: logga in med den här e-postadressen så hanterar Sola, vår live-assistent, din förfrågan direkt.',
    update: 'Vi har uppdaterat dina mäklaruppgifter. Du bokar visningar som vanligt på <a href="https://agents.gruposoltura.com" style="color:#E31E24">agents.gruposoltura.com</a> med den här e-postadressen.',
    details: ['Namn', 'Byrå', 'E-post', 'Mobil'], btn: 'Till mäklarportalen' },
};
const escH = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function codeMail(to: string, lang: string, code: string, purpose: string, first: string) {
  const t = CM[lang] || CM.en;
  const inner = '<p>' + escH(t.hi(first)) + '</p><p>' + (purpose === 'register' ? t.p_reg : t.p_login) + '</p>'
    + '<div style="margin:18px 0;text-align:center"><span style="display:inline-block;font:700 32px/1 Arial,sans-serif;letter-spacing:8px;background:#fdf0f0;border:2px solid #E31E24;border-radius:10px;padding:14px 20px;color:#222">' + code + '</span></div>'
    + '<p style="font-size:13px;color:#666">' + t.valid + '</p><p>' + t.sign + '</p>';
  return { kind: 'portal_code', to, toName: first || '', replyTo: SENDER.email, subject: (purpose === 'register' ? t.s_reg : t.s_login) + ' · ' + code, html: shell(inner, lang) };
}
function welcomeMail(to: string, lang: string, data: any, created: boolean) {
  const t = CM[lang] || CM.en;
  const rows = [[t.details[0], ((data.first_name || '') + ' ' + (data.last_name || '')).trim()], [t.details[1], data.company], [t.details[2], data.email], [t.details[3], data.mobile]]
    .map((r) => '<tr><td style="padding:3px 16px 3px 0;color:#777;font-family:Arial,sans-serif">' + escH(r[0]) + '</td><td style="padding:3px 0;color:#222;font-family:Arial,sans-serif">' + escH(r[1] || '—') + '</td></tr>').join('');
  const inner = '<p>' + escH(t.hi(data.first_name)) + '</p><p>' + (created ? t.welcome : t.update) + '</p>'
    + '<div style="background:#ecf8f0;border-left:3px solid #1e9e57;border-radius:4px;padding:10px 14px;margin:14px 0;font-size:14px"><table cellpadding="0" cellspacing="0">' + rows + '</table></div>'
    + '<table align="center" cellpadding="0" cellspacing="0" style="margin:20px auto"><tr><td align="center" style="border-radius:4px;background:#E31E24"><a href="https://agents.gruposoltura.com" style="display:inline-block;color:#ffffff;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;text-decoration:none;padding:12px 22px">' + escH(t.btn) + '</a></td></tr></table>'
    + '<p>' + t.sign + '</p>';
  return { kind: 'portal_welcome', to, toName: data.first_name || '', replyTo: SENDER.email, subject: created ? t.s_welcome : t.s_update, html: shell(inner, lang) };
}
async function sendCode(email: string, purpose: 'login' | 'register', payload: Record<string, unknown>, lang: string, first: string) {
  const code = newCode();
  const cid = await rpc('agent_portal_code_new', { p_email: email, p_purpose: purpose, p_hash: await sha('code:' + code), p_payload: payload });
  if (!cid) return { ok: false, error: 'rate' };
  const sent = await sendMails([codeMail(email, lang, code, purpose, first)], false, 'portal-code');
  if (!sent[0] || !sent[0].sent) return { ok: false, error: 'mail' };
  return { ok: true, code: true, cid, masked: mask(email) };
}
async function newDevice(cid: string, email: string, ua: unknown) {
  const tok = randToken();
  await rpc('agent_portal_device_new', { p_contact: cid, p_email: email, p_hash: await sha('dev:' + tok), p_ua: str(ua, 300) });
  return tok;
}
const agentOut = (ag: any) => ({ first_name: ag.first_name || '', last_name: ag.last_name || '', company: ag.company || '', language: ag.language || null });
const cleanReg = (b: any) => ({ company: str(b.company, 120), first_name: str(b.first_name, 60), last_name: str(b.last_name, 80),
  email: str(b.email, 160).toLowerCase().replace(/\s+/g, ''), mobile: str(b.mobile, 30) });
function regValid(r: any) {
  if (!r.company || !r.first_name || !r.last_name) return 'fields';
  if (!EMAIL.test(r.email)) return 'email';
  const d = digits(r.mobile); if (d.length < 9 || d.length > 15) return 'mobile';
  return '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  const b = await req.json().catch(() => ({}));
  const ip = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'x';
  try {
    // ---------- 1. inloggen: bekende makelaar? vertrouwd apparaat, anders e-mailcode ----------
    if (b.action === 'check') {
      if (limited(ip)) return json({ ok: false, error: 'rate' }, 429);
      const email = str(b.email, 160).toLowerCase().replace(/\s+/g, '');
      if (!EMAIL.test(email)) return json({ ok: true, known: false });
      const ag = await agentOf(email);
      if (!ag || !ag.id) { console.log('AGENT_GATE unknown ' + email.replace(/^(.).*@/, '$1***@')); return json({ ok: true, known: false }); }
      if (b.device) {
        const cid = await rpc('agent_portal_device_check', { p_hash: await sha('dev:' + str(b.device, 200)), p_email: email });
        if (cid && cid === ag.id) return json({ ok: true, known: true, agent: agentOut(ag), token: await sign(email, ag.id) });
      }
      const r = await sendCode(email, 'login', { contact_id: ag.id }, lang4(b.lang || ag.language), ag.first_name || '');
      if (!r.ok) return json({ ok: false, known: true, error: r.error }, r.error === 'rate' ? 429 : 502);
      return json({ ok: true, known: true, code: true, cid: r.cid, masked: r.masked });
    }

    // ---------- 2. code invoeren (inloggen of registratie bevestigen) ----------
    if (b.action === 'verify') {
      if (limited('v:' + ip, 20)) return json({ ok: false, error: 'rate' }, 429);
      const code = digits(b.code).slice(0, 6);
      if (!/^[0-9a-f-]{36}$/i.test(String(b.cid || '')) || code.length !== 6) return json({ ok: true, valid: false, reason: 'wrong' });
      const chk = await rpc('agent_portal_code_check', { p_id: b.cid, p_hash: await sha('code:' + code) });
      if (!chk || !chk.ok) return json({ ok: true, valid: false, reason: (chk && chk.reason) || 'wrong' });
      const email = String(chk.email);
      let registered = false, created = false, changes: string[] = [];
      if (chk.purpose === 'register') {
        const p = chk.payload || {};
        const reg = await rpc('agent_portal_register', { p: { ...p.data, email, target: p.target || null, apply: p.choice !== 'login', language: p.lang } });
        registered = true; created = !!reg.created; changes = Array.isArray(reg.changes) ? reg.changes : [];
        // welkom of bijgewerkt (alleen als er iets veranderde) + Telegram aan Rick bij elke registratie of wijziging
        if (created || changes.length) {
          const d = p.data || {};
          const conflict = p.conflict ? '\nLet op: het mobiele nummer staat ook bij een ander contact (' + escH(p.conflict.email || p.conflict.id) + '), daar niet weggehaald.' : '';
          const body = (created ? 'Nieuw' : 'Bestaand contact bijgewerkt') + ': <b>' + escH(((d.first_name || '') + ' ' + (d.last_name || '')).trim()) + '</b> · ' + escH(d.company || '')
            + '\n' + escH(email) + ' · ' + escH(d.mobile || '') + (p.choice && p.choice !== 'new' ? '\nOpgegeven reden: ' + escH(p.choice) + (p.note ? ' - ' + escH(p.note) : '') : '')
            + (changes.length && !created ? '\nWijzigingen: ' + escH(changes.join('; ')) : '') + (reg.before ? '\nWas: ' + escH([reg.before.first_name, reg.before.last_name].filter(Boolean).join(' ')) + ' · ' + escH(reg.before.company || '-') + ' · ' + escH((reg.before.emails || []).join(', ')) : '') + conflict;
          await sendMails([welcomeMail(email, lang4(p.lang), { ...d, email }, created)], false, 'portal-registration',
            { source: 'AgentPortal', status: created ? 'ok' : 'info', title: created ? 'Makelaar geregistreerd via het portaal' : 'Makelaarsgegevens gewijzigd via het portaal', body });
        }
        await logRun('ok', 'makelaarsportaal registratie ' + (created ? 'nieuw' : changes.length ? 'bijgewerkt' : 'ingelogd') + ' - ' + email + (changes.length && !created ? ' (' + changes.join('; ') + ')' : ''),
          { channel: 'website', action: 'register', created, changes, choice: p.choice || null });
      }
      const ag = await agentOf(email);
      if (!ag || !ag.id) return json({ ok: false, error: 'server' }, 500);
      const device = await newDevice(ag.id, email, b.ua);
      return json({ ok: true, valid: true, token: await sign(email, ag.id), device, email, agent: agentOut(ag), registered, created, changed: changes.length > 0 });
    }

    // ---------- 3. registratie: controle op e-mail en mobiel (zegt niets over wie het is) ----------
    if (b.action === 'reg_check' || b.action === 'reg_send') {
      if (limited('r:' + ip, 15)) return json({ ok: false, error: 'rate' }, 429);
      const r = cleanReg(b);
      const bad = regValid(r);
      if (bad) return json({ ok: true, valid: false, field: bad });
      const lk = (await rpc('agent_portal_reg_lookup', { p_email: r.email, p_mobile: r.mobile })) || {};
      const e = lk.email_contact, m = lk.mobile_contact;
      const known = !!(e || m);
      const diff = e ? { company: !!(e.company && normName(e.company) !== normName(r.company)), name: normName((e.first_name || '') + (e.last_name || '')) !== normName(r.first_name + r.last_name), mobile: !e.has_mobile } : null;
      if (b.action === 'reg_check') {
        return json({ ok: true, valid: true, status: known ? 'known' : 'new', email_known: !!e, email_is_agent: !!(e && e.is_agent), same_contact: !!(e && e.has_mobile),
          mobile_other: !!m, mobile_other_is_agent: !!(m && m.is_agent), masked_other: m ? mask(m.email) : '', diff });
      }
      // reg_send: plan vastleggen, code naar het OPGEGEVEN adres (bewijst dat het adres van deze makelaar is)
      const choice = ['new', 'login', 'moved', 'name', 'mobile', 'email', 'other'].includes(String(b.choice)) ? String(b.choice) : (known ? 'other' : 'new');
      // doelcontact: het e-mailadres wint (de code bewijst dat het adres van deze makelaar is). Alleen het mobiel bekend:
      // samenvoegen met dat contact uitsluitend als het 'mijn oude e-mailadres' was EN de makelaardij gelijk is; anders een
      // nieuw contact (zo kan niemand via een bekend nummer het account van een ander overnemen). Het andere contact blijft
      // ongemoeid en Rick krijgt de dubbele telefoonregistratie in de Telegram-melding.
      const sameCo = !!(m && (!m.company || normName(m.company) === normName(r.company)));
      const target = e ? e.id : (m && choice === 'email' && sameCo ? m.id : null);
      const conflict = m && target !== m.id ? { id: m.id, email: m.email } : null;
      const plan = { data: r, target, choice, note: str(b.note, 300), lang: lang4(b.lang), conflict };
      const sc = await sendCode(r.email, 'register', plan, lang4(b.lang), r.first_name);
      if (!sc.ok) return json({ ok: false, error: sc.error }, sc.error === 'rate' ? 429 : 502);
      return json({ ok: true, code: true, cid: sc.cid, masked: sc.masked });
    }

    // ---------- apparaat vergeten (uitloggen) ----------
    if (b.action === 'forget') {
      if (b.device) await rpc('agent_portal_device_forget', { p_hash: await sha('dev:' + str(b.device, 200)) });
      return json({ ok: true });
    }

    const ses = await verify(b.token);
    if (!ses) return json({ ok: false, error: 'session' }, 401);

    // ---------- 4. woning opzoeken (tijdens het gesprek) ----------
    if (b.action === 'property') {
      const ref = parseRef(b.ref);
      if (!ref) return json({ ok: true, found: false, ref: '' });
      const cx = await context(ses.e, ref, false);
      const p = cx.property;
      if (!p) return json({ ok: true, found: false, ref });
      const { data: w } = await sb.from('web_properties').select('reference,heading,town,image,price,bedrooms,category,url_new').eq('reference', p.reference).maybeSingle();
      return json({ ok: true, found: true, ref: p.reference, available: p.status === 'available', status: p.status,
        title: (w && w.heading) || p.title || '', town: (w && w.town) || p.town || '', image: (w && w.image) || null,
        price: w && w.price != null ? Number(w.price) : null, beds: (w && w.bedrooms) || null, category: (w && w.category) || null, url: (w && w.url_new) || null,
        has_keys: !!p.has_keys, rep_first: p.rep_name || null });
    }

    // ---------- 4b. klantcheck (Client Claim System, BD-171) ----------
    // Sola vraagt naam + e-mail tot en met '@' en checkt hier of de klant al bij ons bekend is.
    if (b.action === 'client_check') {
      const ag0 = await agentOf(ses.e);
      if (!ag0 || ag0.id !== ses.c) return json({ ok: false, error: 'session' }, 401);
      const local0 = localOf(b.client_local);
      const first0 = str(b.client_first, 60), last0 = str(b.client_last, 80), ref0 = parseRef(b.ref);
      if (local0.length < 2) return json({ ok: true, status: 'free', local: local0 });
      const ck = (await rpc('nexus2_claim_check', { p_local: local0, p_agent_email: ses.e })) || {};
      if (ck.status === 'known') {
        await sendMails([], false, ref0 || 'claim', claimAlarm(ag0, ses.e, first0, last0, local0, ref0));
        await logRun('warn', 'makelaarsportaal geweigerd - klant al bekend - ' + ses.e + (ref0 ? ' - ' + ref0 : '') + ' - ' + local0 + '@',
          { channel: 'website', outcome: 'client_known', ref: ref0 || null, makelaar_email: ses.e, client_local: local0 });
        try {
          await rpc('nexus2_viewing_intake_log', { p: { source_msg_id: 'claim:' + crypto.randomUUID(), channel: 'website', sender_email: ses.e, sender_name: ag0.name || null,
            agent_contact_id: ag0.id, agent_known: true, kind: 'viewing', outcome: 'client_known', missing: [], ref: ref0 || null,
            client_name: ((first0 + ' ' + last0).trim() || null), language: lang4(b.lang), mails: [], dry_run: false } });
        } catch (e) { console.error('INTAKE_ERR ' + String((e as Error)?.message || e)); }
        return json({ ok: true, status: 'known' });
      }
      return json({ ok: true, status: ck.status === 'own' ? 'own' : 'free' });
    }

    // ---------- 5. aanvraag verwerken ----------
    if (b.action === 'submit') {
      const test = b.test === true;
      const ag = await agentOf(ses.e);
      if (!ag || ag.id !== ses.c) return json({ ok: false, error: 'session' }, 401); // label agent intussen weg
      const nonce = str(b.nonce, 64).replace(/[^a-z0-9-]/gi, '') || crypto.randomUUID();
      const srcId = 'web:' + nonce;
      const parsed = { client_first: str(b.client_first, 60), client_last: str(b.client_last, 80), ref: parseRef(b.ref), day: str(b.day, 60), time: str(b.time, 40), language: str(b.lang, 5) };
      const local = localOf(b.client_local);
      // Client Claim System (BD-171): bekend bij ons -> weigeren, alarm naar Rick. Eigen klant van dezelfde makelaar -> hergebruiken.
      const claim: any = local.length >= 2 ? ((await rpc('nexus2_claim_check', { p_local: local, p_agent_email: ses.e })) || {}) : { status: 'free' };
      if (claim.status === 'known') {
        if (!test) await sendMails([], false, parsed.ref || 'claim', claimAlarm(ag, ses.e, parsed.client_first, parsed.client_last, local, parsed.ref));
        await logRun('warn', (test ? '[TEST] ' : '') + 'makelaarsportaal geweigerd - klant al bekend - ' + ses.e + (parsed.ref ? ' - ' + parsed.ref : '') + ' - ' + local + '@',
          { channel: 'website', outcome: 'client_known', ref: parsed.ref || null, makelaar_email: ses.e, client_local: local, dry_run: test });
        try {
          await rpc('nexus2_viewing_intake_log', { p: { source_msg_id: srcId, channel: 'website', sender_email: ses.e, sender_name: ag.name || null,
            agent_contact_id: ag.id, agent_known: true, kind: 'viewing', outcome: 'client_known', missing: [], ref: parsed.ref || null,
            client_name: ((parsed.client_first + ' ' + parsed.client_last).trim() || null), day: parsed.day, time: parsed.time,
            language: lang4(b.lang), mails: [], dry_run: test } });
        } catch (e) { console.error('INTAKE_ERR ' + String((e as Error)?.message || e)); }
        return json({ ok: true, outcome: 'client_known' });
      }
      const cx = await context(ses.e, parsed.ref, test);
      // Wie behandelt deze aanvraag: portaalleads naar Lisette (BD-165), terugval de salesrep van de woning (BD-170).
      const handler = (await rpc('nexus2_agent_viewing_rep', { p_ref: parsed.ref || null })) || { email: 'info@gruposoltura.com', name: 'Soltura Real Estate' };
      const summary = `Aanvraag via het makelaarsportaal (gesprek met Sola) door ${ag.name || ses.e}${ag.company ? ' (' + ag.company + ')' : ''}.\n`
        + `Woning: ${parsed.ref}\nKlant: ${parsed.client_first} ${parsed.client_last}\nGewenste dag: ${parsed.day}\nGewenste tijd: ${parsed.time}`
        + (b.note ? `\nOpmerking van de makelaar: ${str(b.note, 500)}` : '');
      const ctx: any = { lang: parsed.language, dry: false /* testmails regelen we hieronder */, channel: 'website',
        sender: { email: ses.e, name: ag.name || '' }, headers: {}, agent: { id: ag.id, name: ag.name, first_name: ag.first_name, company: ag.company, mobile: ag.mobile },
        openChain: null, repliesLast24h: 0, property: cx.property || null, parsed, handler,
        original: { subject: 'Makelaarsportaal · ' + parsed.ref + ' · ' + (parsed.client_first + ' ' + parsed.client_last).trim(), body: summary } };
      const d = VM.decide(ctx);
      const client = (d.view.client_first + ' ' + d.view.client_last).trim();
      let sub: any = {};
      if (d.route === 'process') {
        if (test) sub = { request_id: 'test', contact_id: null, duplicate: false };
        else {
          try {
            sub = await rpc('nexus2_submit_form', { p: {
              // de klant blijft 90 dagen van de makelaar: label claimed, nooit in een mailing (BD-170, BD-171)
              first_name: d.view.client_first || null, last_name: d.view.client_last || null, language: d.lang, role: 'claimed', type: 'viewing', kind: 'viewing',
              message: 'Bezichtigingsverzoek ' + d.view.ref + ' voor klant ' + client + ', aangebracht door makelaar ' + (ag.name || ses.e) + (ag.company ? ' (' + ag.company + ')' : '') + ', ' + ses.e
                + '. Gewenste dag: ' + d.view.day + ', tijd: ' + d.view.time + '. Via het makelaarsportaal op de website (Sola).' + (b.note ? ' Opmerking: ' + str(b.note, 500) : ''),
              subject: 'Bezichtigingsverzoek ' + d.view.ref + ' - ' + client, property_ref: d.view.ref, source: 'agent-portal', form_id: 'web-agent-viewing',
              introduced_by_email: ses.e, owner_email: handler.email || null, source_request_id: srcId,
              page_url: str(b.page_url, 300) || null, payload: { channel: 'agent-portal', agent_email: ses.e, day: d.view.day, time: d.view.time, chat_lang: str(b.lang, 5) }, utm: {} } }) || {};
          } catch (e) { sub = { error: String((e as Error)?.message || e).slice(0, 300) }; }
          // zelfde klant van dezelfde makelaar: aanvraag aan het bestaande claim-contact hangen; daarna de claim vastleggen
          const isId = (x: unknown) => /^[0-9a-f-]{36}$/i.test(String(x || ''));
          if (claim.status === 'own' && isId(claim.contact_id) && isId(sub.request_id) && sub.contact_id !== claim.contact_id) {
            try { await rpc('nexus2_claim_attach', { p_request_id: sub.request_id, p_keep_contact: claim.contact_id }); sub.contact_id = claim.contact_id; }
            catch (e) { console.error('CLAIM_ATTACH_ERR ' + String((e as Error)?.message || e)); }
          }
          if (local.length >= 2 && isId(sub.contact_id)) {
            try { await rpc('nexus2_claim_register', { p_contact_id: sub.contact_id, p_local: local }); }
            catch (e) { console.error('CLAIM_REG_ERR ' + String((e as Error)?.message || e)); }
          }
        }
      }
      const res = VM.compose(ctx, d, { submit: sub });
      if (sub.duplicate) {
        // dubbel verstuurd (zelfde nonce): niets opnieuw mailen of loggen
        const p = cx.property || {};
        return json({ ok: true, outcome: 'processed', duplicate: true, has_keys: !!p.has_keys, rep: { name: p.rep_name, full_name: p.rep_full_name, email: p.rep_email, mobile: p.rep_mobile } });
      }
      const mails: any[] = res.mails.length ? await sendMails(res.mails.map((m: any) => ({ ...m, html: m.internal ? m.html : utm(m.html) })), test, d.view.ref) : [];
      const p = cx.property || {};
      const isUuid = (s: unknown) => /^[0-9a-f-]{36}$/i.test(String(s || ''));
      const intake = { source_msg_id: srcId, channel: 'website', sender_email: ses.e, sender_name: ag.name || null, agent_contact_id: ag.id, agent_known: true,
        kind: 'viewing', outcome: res.outcome, missing: d.missing || [], ref: d.view.ref || null, property_id: p.id || null, client_name: client || null,
        day: d.view.day, time: d.view.time, language: d.lang, request_id: isUuid(sub.request_id) ? sub.request_id : null,
        client_contact_id: isUuid(sub.contact_id) ? sub.contact_id : null, rep_email: res.outcome === 'processed' || res.outcome === 'nexus_failed' ? (handler.email || p.rep_email || null) : null,
        mails, note: sub.error || null, dry_run: test };
      try { await rpc('nexus2_viewing_intake_log', { p: intake }); } catch (e) { console.error('INTAKE_ERR ' + String((e as Error)?.message || e)); }
      const failed = mails.some((m) => !m.sent);
      await logRun(res.outcome === 'nexus_failed' || failed ? 'warn' : 'ok',
        (test ? '[TEST] ' : '') + 'makelaarsportaal ' + res.outcome + ' - ' + ses.e + (d.view.ref ? ' - ' + d.view.ref : '') + (client ? ' - ' + client : '')
          + (d.missing && d.missing.length ? ' (ontbrak: ' + d.missing.join(', ') + ')' : '') + (failed ? ' - MAIL NIET VERSTUURD' : '') + (sub.error ? ' - ' + sub.error : ''),
        { channel: 'website', outcome: res.outcome, ref: d.view.ref, makelaar_email: ses.e, handler: handler.email || null, handler_via: handler.via || null, claim: claim.status || null, client_local: local || null, mails_sent: mails.filter((m) => m.sent).length, mails_failed: mails.filter((m) => !m.sent).length, request_id: intake.request_id, dry_run: test });
      return json({ ok: true, outcome: res.outcome, missing: d.missing || [], has_keys: !!p.has_keys,
        rep: res.outcome === 'processed' ? { name: p.rep_name || null, full_name: p.rep_full_name || null, email: p.rep_email || null, mobile: p.rep_mobile || null } : null,
        mails_sent: mails.filter((m) => m.sent && m.kind === 'confirmation').length > 0, test });
    }
    return json({ ok: false, error: 'action' }, 400);
  } catch (e) {
    console.error('AGENT_VIEWING_ERR ' + String((e as Error)?.message || e));
    await logRun('error', 'makelaarsportaal fout: ' + String((e as Error)?.message || e), { channel: 'website', action: b.action || null });
    return json({ ok: false, error: 'server' }, 500);
  }
});
