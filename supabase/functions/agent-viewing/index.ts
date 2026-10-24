// agent-viewing (24-10-2026): makelaarsportaal op de website (agents.gruposoltura.com -> /en/agents/ · /nl/makelaars/ · /sv/maklare/).
// Een samenwerkende makelaar vraagt in gesprek met Sola een bezichtiging aan. De afhandeling is DEZELFDE als bij een mail aan
// viewing@gruposoltura.com (n8n JARVIS-AppointmentAgent-v2): zelfde beslisregels en mails (viewing-mails.ts = kopie van node "Decide"),
// suspect + bezichtigingsaanvraag in NEXUS via nexus2_submit_form (makelaar = aanbrenger, verkoper = eigenaar), bevestiging aan de
// makelaar en interne melding aan de verkoper via Brevo (afzender viewing@), regel in core.viewing_intake (menu Bezichtiging) en jarvis_runs.
// Verschil met de mailflow: de bron is 'agent-portal' (form_id web-agent-viewing, channel 'website') en de makelaar MOET al bekend zijn
// (label agent): onbekende adressen krijgen geen registratie aangeboden, de site stuurt ze terug naar de homepage.
//
// POST { action: 'check', email }                        -> { known, agent:{first_name,company}, token }
// POST { action: 'property', token, ref }                 -> { found, available, ref, title, town, image, price, beds, url, has_keys, rep_first }
// POST { action: 'submit', token, ref, client_first, client_last, day, time, lang, nonce, page_url, test }
//                                                         -> { ok, outcome, rep:{name,full_name,email,mobile}, has_keys, mails_sent }
// test=true (pagina met ?test=1): niets in NEXUS, alle mails alleen naar rick@ met [TEST], intake als dry-run.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { VM } from './viewing-mails.ts';

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
async function sendMails(list: any[], test: boolean, ref: string) {
  const mails = list.map((m) => ({ kind: m.kind, to: test ? TEST_EMAIL : m.to, toName: m.toName || '', replyTo: m.replyTo || SENDER.email,
    subject: test ? `[TEST → ${m.to}] ${m.subject}` : m.subject, html: m.html }));
  const fail = (e: string) => list.map((m) => ({ kind: m.kind, to: m.to, subject: m.subject, sent: false, error: e }));
  try {
    if (!relayKey) { const k = await sb.from('fn_keys').select('value').eq('name', 'agent-portal-mail').maybeSingle(); relayKey = (k.data && k.data.value) || ''; }
    const r = await fetch(RELAY, { method: 'POST', headers: { 'content-type': 'application/json', 'x-fn-key': relayKey }, body: JSON.stringify({ mails, ref, test }), signal: AbortSignal.timeout(25000) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok || !Array.isArray(j.results)) return fail(`relay ${r.status}`);
    return list.map((m, i) => ({ kind: m.kind, to: m.to, subject: m.subject, sent: !!(j.results[i] && j.results[i].sent), error: j.results[i] ? j.results[i].error : 'geen resultaat' }));
  } catch (e) { return fail(String((e as Error)?.message || e).slice(0, 160)); }
}

// UTM op links naar de site (zelfde conventie als node "Pick Mails": utm_source=brevo, utm_medium=email, utm_campaign=viewing)
function utm(html: string) {
  return html.replace(/(href\s*=\s*)(["'])(https?:\/\/(?:www\.)?gruposoltura\.com(?:[\/?#][^"']*)?)\2/gi, (all, pre, q, url) => {
    if (/\/unsubscribe|privacy|[?&]utm_/i.test(url)) return all;
    url = url.replace(/^https?:\/\/(?:www\.)?gruposoltura\.com/i, 'https://gruposoltura.com');
    const i = url.indexOf('#'); let base = i >= 0 ? url.slice(0, i) : url; const hash = i >= 0 ? url.slice(i) : '';
    if (/^https:\/\/gruposoltura\.com$/i.test(base)) base += '/';
    return pre + q + base + (base.includes('?') ? '&' : '?') + 'utm_source=brevo&utm_medium=email&utm_campaign=viewing&utm_content=footer' + hash + q;
  });
}

async function logRun(status: string, summary: string, stats: Record<string, unknown>) {
  try { await sb.from('jarvis_runs').insert({ workflow: 'AppointmentAgentV2', status, summary: summary.slice(0, 500), stats }); } catch (_e) { /* best effort */ }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  const b = await req.json().catch(() => ({}));
  const ip = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'x';
  try {
    // ---------- 1. is dit een bekende makelaar? ----------
    if (b.action === 'check') {
      if (limited(ip)) return json({ ok: false, error: 'rate' }, 429);
      const email = str(b.email, 160).toLowerCase();
      if (!EMAIL.test(email)) return json({ ok: true, known: false });
      const ag = await agentOf(email);
      if (!ag || !ag.id) { console.log('AGENT_GATE unknown ' + email.replace(/^(.).*@/, '$1***@')); return json({ ok: true, known: false }); }
      return json({ ok: true, known: true, agent: { first_name: ag.first_name || '', last_name: ag.last_name || '', company: ag.company || '', language: ag.language || null }, token: await sign(email, ag.id) });
    }

    const ses = await verify(b.token);
    if (!ses) return json({ ok: false, error: 'session' }, 401);

    // ---------- 2. woning opzoeken (tijdens het gesprek) ----------
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

    // ---------- 3. aanvraag verwerken (zelfde regels als viewing@) ----------
    if (b.action === 'submit') {
      const test = b.test === true;
      const ag = await agentOf(ses.e);
      if (!ag || ag.id !== ses.c) return json({ ok: false, error: 'session' }, 401); // label agent intussen weg
      const nonce = str(b.nonce, 64).replace(/[^a-z0-9-]/gi, '') || crypto.randomUUID();
      const srcId = 'web:' + nonce;
      const parsed = { client_first: str(b.client_first, 60), client_last: str(b.client_last, 80), ref: parseRef(b.ref), day: str(b.day, 60), time: str(b.time, 40), language: str(b.lang, 5) };
      const cx = await context(ses.e, parsed.ref, test);
      const summary = `Aanvraag via het makelaarsportaal (gesprek met Sola) door ${ag.name || ses.e}${ag.company ? ' (' + ag.company + ')' : ''}.\n`
        + `Woning: ${parsed.ref}\nKlant: ${parsed.client_first} ${parsed.client_last}\nGewenste dag: ${parsed.day}\nGewenste tijd: ${parsed.time}`
        + (b.note ? `\nOpmerking van de makelaar: ${str(b.note, 500)}` : '');
      const ctx: any = { lang: parsed.language, dry: false /* testmails regelen we hieronder */, channel: 'website',
        sender: { email: ses.e, name: ag.name || '' }, headers: {}, agent: { id: ag.id, name: ag.name, first_name: ag.first_name, company: ag.company, mobile: ag.mobile },
        openChain: null, repliesLast24h: 0, property: cx.property || null, parsed,
        original: { subject: 'Makelaarsportaal · ' + parsed.ref + ' · ' + (parsed.client_first + ' ' + parsed.client_last).trim(), body: summary } };
      const d = VM.decide(ctx);
      const client = (d.view.client_first + ' ' + d.view.client_last).trim();
      let sub: any = {};
      if (d.route === 'process') {
        if (test) sub = { request_id: 'test', contact_id: null, duplicate: false };
        else {
          try {
            sub = await rpc('nexus2_submit_form', { p: {
              first_name: d.view.client_first || null, last_name: d.view.client_last || null, language: d.lang, role: 'suspect', type: 'viewing', kind: 'viewing',
              message: 'Bezichtigingsverzoek ' + d.view.ref + ' voor klant ' + client + ', aangebracht door makelaar ' + (ag.name || ses.e) + (ag.company ? ' (' + ag.company + ')' : '') + ', ' + ses.e
                + '. Gewenste dag: ' + d.view.day + ', tijd: ' + d.view.time + '. Via het makelaarsportaal op de website (Sola).' + (b.note ? ' Opmerking: ' + str(b.note, 500) : ''),
              subject: 'Bezichtigingsverzoek ' + d.view.ref + ' - ' + client, property_ref: d.view.ref, source: 'agent-portal', form_id: 'web-agent-viewing',
              introduced_by_email: ses.e, owner_email: (cx.property && cx.property.rep_email) || null, source_request_id: srcId,
              page_url: str(b.page_url, 300) || null, payload: { channel: 'agent-portal', agent_email: ses.e, day: d.view.day, time: d.view.time, chat_lang: str(b.lang, 5) }, utm: {} } }) || {};
          } catch (e) { sub = { error: String((e as Error)?.message || e).slice(0, 300) }; }
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
        client_contact_id: isUuid(sub.contact_id) ? sub.contact_id : null, rep_email: res.outcome === 'processed' || res.outcome === 'nexus_failed' ? (p.rep_email || null) : null,
        mails, note: sub.error || null, dry_run: test };
      try { await rpc('nexus2_viewing_intake_log', { p: intake }); } catch (e) { console.error('INTAKE_ERR ' + String((e as Error)?.message || e)); }
      const failed = mails.some((m) => !m.sent);
      await logRun(res.outcome === 'nexus_failed' || failed ? 'warn' : 'ok',
        (test ? '[TEST] ' : '') + 'makelaarsportaal ' + res.outcome + ' - ' + ses.e + (d.view.ref ? ' - ' + d.view.ref : '') + (client ? ' - ' + client : '')
          + (d.missing && d.missing.length ? ' (ontbrak: ' + d.missing.join(', ') + ')' : '') + (failed ? ' - MAIL NIET VERSTUURD' : '') + (sub.error ? ' - ' + sub.error : ''),
        { channel: 'website', outcome: res.outcome, ref: d.view.ref, makelaar_email: ses.e, mails_sent: mails.filter((m) => m.sent).length, mails_failed: mails.filter((m) => !m.sent).length, request_id: intake.request_id, dry_run: test });
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
