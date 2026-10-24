// GEDEELDE MAILCODE · kopie van de n8n-node "Decide" (JARVIS-AppointmentAgent-v2, viewing-mails v1, 20-10-2026)
// met kanaal-uitbreiding (24-10-2026): ctx.channel === 'website' -> footer- en meldingsregels noemen het makelaarsportaal.
// Registratiemails zijn weggelaten: in het portaal is de makelaar altijd al bekend. Voor viewing@ (ctx.channel leeg) is de
// uitkomst van de overige mails byte-gelijk aan de node. Wijzig beide plekken samen.
// deno-lint-ignore-file
export const VM: any = (function () {
'use strict';
var SENDER = { name: 'Grupo Soltura · Viewings', email: 'viewing@gruposoltura.com' };
var REQ_VIEW = ['client_first', 'client_last', 'ref', 'day', 'time'];
var REQ_REG = ['first_name', 'last_name', 'company', 'email', 'mobile'];

var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
var clean = function (s) { return String(s == null ? '' : s).trim(); };
var L2 = function (l) { l = String(l || 'en').slice(0, 2).toLowerCase(); return (l === 'nl' || l === 'es') ? l : 'en'; };

var LBL = {
nl: { client_first: 'voornaam van uw klant', client_last: 'achternaam van uw klant', ref: 'onze referentie van de woning (bijv. RH864)',
day: 'gewenste dag van de bezichtiging', time: 'gewenste tijd van de bezichtiging',
first_name: 'uw voornaam', last_name: 'uw achternaam', company: 'de naam van uw makelaardij', email: 'uw e-mailadres', mobile: 'uw mobiele nummer' },
en: { client_first: "your client's first name", client_last: "your client's last name", ref: 'our property reference (e.g. RH864)',
day: 'preferred day of the viewing', time: 'preferred time of the viewing',
first_name: 'your first name', last_name: 'your last name', company: 'the name of your agency', email: 'your email address', mobile: 'your mobile number' },
es: { client_first: 'nombre de su cliente', client_last: 'apellidos de su cliente', ref: 'nuestra referencia del inmueble (p. ej. RH864)',
day: 'dia preferido para la visita', time: 'hora preferida para la visita',
first_name: 'su nombre', last_name: 'sus apellidos', company: 'el nombre de su agencia', email: 'su correo electronico', mobile: 'su numero de movil' }
};
var T = {
nl: { hi: function (n) { return n ? 'Beste ' + esc(n) + ',' : 'Beste collega,'; }, sign: 'Met vriendelijke groet,<br>Het team van Grupo Soltura Real Estate',
notConf: 'Let op: uw bezichtigingsaanvraag is hiermee <b>niet bevestigd</b>.', onlyComplete: 'Wij kunnen alleen complete e-mails met alle benodigde gegevens verwerken.',
missingHead: 'Wat er ontbrak:', allHead: 'Stuur ons daarom één nieuwe e-mail met <b>alle</b> onderstaande gegevens:',
received: 'Wat wij van u ontvingen:', tip: 'Tip: zet de gegevens gewoon in het onderwerp of de tekst, bijvoorbeeld:',
example: 'Bezichtiging RH864 – Jan Jansen – dinsdag 28/10 om 11:00' },
en: { hi: function (n) { return n ? 'Dear ' + esc(n) + ',' : 'Dear colleague,'; }, sign: 'Kind regards,<br>The team at Grupo Soltura Real Estate',
notConf: 'Please note: your viewing request is <b>not confirmed</b> at this stage.', onlyComplete: 'We can only process complete emails containing all required details.',
missingHead: 'What was missing:', allHead: 'Please send us one new email containing <b>all</b> of the following:',
received: 'What we received from you:', tip: 'Tip: simply put the details in the subject line or the body, for example:',
example: 'Viewing RH864 – John Smith – Tuesday 28/10 at 11:00' },
es: { hi: function (n) { return n ? 'Estimado/a ' + esc(n) + ',' : 'Estimado/a colega,'; }, sign: 'Un cordial saludo,<br>El equipo de Grupo Soltura Real Estate',
notConf: 'Atencion: su solicitud de visita <b>no esta confirmada</b> todavia.', onlyComplete: 'Solo podemos procesar correos completos con todos los datos necesarios.',
missingHead: 'Lo que faltaba:', allHead: 'Por favor, envienos un nuevo correo con <b>todos</b> los datos siguientes:',
received: 'Lo que recibimos de usted:', tip: 'Consejo: incluya los datos en el asunto o en el texto, por ejemplo:',
example: 'Visita RH864 – Juan Garcia – martes 28/10 a las 11:00' }
};

var ul = function (arr) { return '<ul style="margin:6px 0 14px;padding-left:20px">' + arr.map(function (x) { return '<li style="margin:2px 0">' + x + '</li>'; }).join('') + '</ul>'; };
var box = function (html, tone) {
var c = { warn: ['#fff8e1', '#e8a000'], ok: ['#ecf8f0', '#1e9e57'], info: ['#f4f4f4', '#bdbdbd'], bad: ['#fdecec', '#c62828'] }[tone || 'info'];
return '<div style="background:' + c[0] + ';border-left:3px solid ' + c[1] + ';border-radius:4px;padding:10px 14px;margin:14px 0;font-size:14px">' + html + '</div>';
};
var kv = function (rows) {
return '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 14px;font-size:14px">' + rows.filter(function (r) { return r; }).map(function (r) {
return '<tr><td style="padding:3px 16px 3px 0;color:#777;white-space:nowrap;vertical-align:top">' + esc(r[0]) + '</td><td style="padding:3px 0;color:#222">' + (r[2] ? r[1] : esc(r[1] || '—')) + '</td></tr>';
}).join('') + '</table>';
};
var HEADER = 'https://res.cloudinary.com/dxmx3a2ea/image/upload/v1792266662/soltura/assets/email/soltura-email-header.jpg';
var wrap = function (inner, lang, internal, web) {
var year = new Date().getFullYear();
var rights = { nl: 'Alle rechten voorbehouden.', en: 'All rights reserved.', es: 'Todos los derechos reservados.' }[lang] || 'All rights reserved.';
var why = internal ? 'Interne melding van JARVIS &middot; bezichtigingsaanvraag via ' + (web ? 'het makelaarsportaal (Sola, agents.gruposoltura.com)' : 'viewing@gruposoltura.com')
: web ? { nl: 'U ontvangt deze e-mail naar aanleiding van uw aanvraag via het makelaarsportaal agents.gruposoltura.com.', en: 'You receive this email in response to your request via the agent portal agents.gruposoltura.com.', es: 'Recibe este correo en respuesta a su solicitud a traves del portal de agentes agents.gruposoltura.com.' }[lang]
: { nl: 'U ontvangt deze e-mail naar aanleiding van uw bericht aan viewing@gruposoltura.com.', en: 'You receive this email in response to your message to viewing@gruposoltura.com.', es: 'Recibe este correo en respuesta a su mensaje a viewing@gruposoltura.com.' }[lang];
return '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Grupo Soltura Real Estate</title></head>'
+ '<body style="margin:0;padding:0;background:#fdf0f0;font-family:Arial,sans-serif;"><div style="background:#fdf0f0;padding:24px 16px;">'
+ '<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.12);">'
+ '<tr><td style="line-height:0;"><img src="' + HEADER + '" alt="Grupo Soltura Real Estate" width="600" style="width:100%;max-width:600px;display:block;height:auto;"></td></tr>'
+ '<tr><td style="background:#E31E24;padding:10px 28px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="color:#fff;font-size:12px;">Rojales &middot; Alicante &middot; Spain</td><td align="right" style="color:#fff;font-size:12px;font-weight:bold;">+34 966 792 113</td></tr></table></td></tr>'
+ '<tr><td style="padding:28px 32px;color:#333;font-size:15px;line-height:1.6;">' + inner + '</td></tr>'
+ '<tr><td style="padding:24px 32px;border-top:1px solid #ddd;background:#f0f0f0;"><table width="100%" cellpadding="0" cellspacing="0">'
+ '<tr><td align="center" style="padding-bottom:12px"><a href="https://www.gruposoltura.com" style="color:#e8231a;font-size:13px;font-weight:bold;text-decoration:none">www.gruposoltura.com</a></td></tr>'
+ '<tr><td align="center" style="color:#666;font-size:11px;line-height:1.8">Copyright &copy; ' + year + ' Grupo Soltura S.L. - ' + rights + '<br><br>Grupo Soltura S.L.<br>Avd de Constituci&oacute;n s/n<br>03179 Formentera del Segura (ALC)<br><br>'
+ 'Member No. 992 of the Colegio Oficial de Agentes de la Propiedad Inmobiliaria de Alicante (API)<br>'
+ 'Member No. 3.473 of the Asociacion Profesional de Gestores Intermediarios en promociones de Edificaciones (GIPE) y Confederation Europeenne de L&#39;Immobilier (CEI)<br>'
+ 'Member of the Association of International Property Professionals (AIPP)</td></tr>'
+ '<tr><td align="center" style="padding-top:14px;color:#999;font-size:11px;line-height:1.6">' + why + '</td></tr></table></td></tr>'
+ '</table></div></body></html>';
};

function isAuto(ctx) {
var e = (ctx.sender && ctx.sender.email || '').toLowerCase();
var h = ctx.headers || {};
if (!e) return 'geen afzender';
if (/@gruposoltura\.com$/.test(e)) return 'eigen domein';
if (/^(mailer-daemon|postmaster|no-?reply|do-?not-?reply|bounce)/.test(e)) return 'systeemadres';
var as = String(h['auto-submitted'] || '').toLowerCase();
if (as && as !== 'no') return 'automatisch antwoord';
if (h['x-autoreply'] || h['x-autorespond'] || /^(auto|bulk|junk)/i.test(String(h.precedence || ''))) return 'automatisch antwoord';
if ((ctx.repliesLast24h || 0) >= 4) return 'antwoordlimiet (4 per 24 uur) bereikt';
return '';
}

function decide(ctx) {
var p = ctx.parsed || {};
var view = { client_first: clean(p.client_first), client_last: clean(p.client_last), ref: clean(p.ref).toUpperCase(), day: clean(p.day), time: clean(p.time) };
var reg = { first_name: clean(p.agent_first), last_name: clean(p.agent_last), company: clean(p.agent_company),
email: clean(p.agent_email).toLowerCase() || (ctx.sender.email || '').toLowerCase(), mobile: clean(p.agent_mobile) };
var d = { view: view, reg: reg, lang: L2(p.language || ctx.lang), missing: [] };
var why = isAuto(ctx);
if (why) return Object.assign(d, { route: 'skip', outcome: 'skipped', kind: 'skipped', note: why });

if (!ctx.agent) {
var awaiting = ctx.openChain && /^registration_(requested|incomplete)$/.test(ctx.openChain.last_outcome || '');
var hasReg = !!(reg.company || reg.mobile);
var hasView = !!(view.ref || view.client_first || view.client_last || view.day || view.time);
d.kind = 'registration';
d.missing = REQ_REG.filter(function (k) { return !reg[k]; });
if (!d.missing.length) return Object.assign(d, { route: 'register', outcome: 'agent_registered' });
if (!awaiting && (hasView || !hasReg)) return Object.assign(d, { route: 'reply', outcome: 'registration_requested', kind: 'viewing', missing: [] });
return Object.assign(d, { route: 'reply', outcome: 'registration_incomplete' });
}

d.kind = 'viewing';
d.missing = REQ_VIEW.filter(function (k) { return !view[k]; });
if (d.missing.length) return Object.assign(d, { route: 'reply', outcome: 'incomplete' });
if (!ctx.property) return Object.assign(d, { route: 'reply', outcome: 'ref_not_found' });
if (ctx.property.status !== 'available') return Object.assign(d, { route: 'reply', outcome: 'not_available' });
return Object.assign(d, { route: 'process', outcome: 'processed' });
}

function compose(ctx, d, res) {
res = res || {};
var lang = d.lang, t = T[lang], lb = LBL[lang], v = d.view, r = d.reg;
var to = (ctx.sender.email || '').toLowerCase(), agentName = (ctx.agent && (ctx.agent.first_name || ctx.agent.name)) || r.first_name || '';
var client = (v.client_first + ' ' + v.client_last).trim();
var when = [v.day, v.time].filter(Boolean).join(lang === 'en' ? ' at ' : (lang === 'es' ? ' a las ' : ' om '));
var reqList = function (keys) { return ul(keys.map(function (k) { return esc(lb[k]); })); };
var missList = function () { return box('<b>' + t.missingHead + '</b>' + ul(d.missing.map(function (k) { return esc(lb[k]); })), 'warn'); };
var tipBox = box(t.tip + '<br><i>' + esc(t.example) + '</i>', 'info');
var mails = [], outcome = d.outcome;
var M = function (kind, subject, inner, extra) {
mails.push(Object.assign({ kind: kind, to: to, toName: agentName || ctx.sender.name || '', replyTo: SENDER.email, subject: subject, html: wrap(inner, lang, false, ctx.channel === 'website'), internal: false }, extra || {}));
};
var reqViewKeys = ['client_first', 'client_last', 'ref', 'day', 'time'];

if (outcome === 'skipped') return { outcome: outcome, mails: [] };

if (outcome === 'incomplete') {
var S4 = { nl: 'Bezichtigingsaanvraag incompleet – niet bevestigd', en: 'Viewing request incomplete – not confirmed', es: 'Solicitud de visita incompleta – no confirmada' }[lang];
var B4 = {
nl: '<p>Bedankt voor uw bezichtigingsaanvraag. Helaas konden wij deze niet verwerken, omdat niet alle gegevens compleet waren.</p>',
en: '<p>Thank you for your viewing request. Unfortunately we could not process it, because not all details were included.</p>',
es: '<p>Gracias por su solicitud de visita. Lamentablemente no hemos podido procesarla porque faltaban datos.</p>'
}[lang];
M('incomplete', S4, '<p>' + t.hi(agentName) + '</p>' + B4 + missList() + '<p>' + t.allHead + '</p>' + reqList(reqViewKeys)
+ box(t.onlyComplete + ' ' + t.notConf, 'warn') + tipBox + '<p>' + t.sign + '</p>');
}

if (outcome === 'ref_not_found') {
var S5 = { nl: 'Referentie ' + v.ref + ' niet gevonden – aanvraag niet bevestigd', en: 'Reference ' + v.ref + ' not found – request not confirmed', es: 'Referencia ' + v.ref + ' no encontrada – solicitud no confirmada' }[lang];
var B5 = {
nl: '<p>Bedankt voor uw bezichtigingsaanvraag. De woningreferentie <b>' + esc(v.ref) + '</b> komt in ons systeem niet voor. Controleer de referentie (bijv. RH864) en stuur uw aanvraag opnieuw met alle gegevens:</p>',
en: '<p>Thank you for your viewing request. The property reference <b>' + esc(v.ref) + '</b> does not exist in our system. Please check the reference (e.g. RH864) and resend your request with all details:</p>',
es: '<p>Gracias por su solicitud de visita. La referencia <b>' + esc(v.ref) + '</b> no existe en nuestro sistema. Compruebe la referencia (p. ej. RH864) y reenvie su solicitud con todos los datos:</p>'
}[lang];
M('ref_not_found', S5, '<p>' + t.hi(agentName) + '</p>' + B5 + reqList(reqViewKeys) + box(t.notConf, 'warn') + '<p>' + t.sign + '</p>');
}

if (outcome === 'not_available') {
var S6 = { nl: v.ref + ' is niet beschikbaar voor bezichtiging', en: v.ref + ' is not available for viewings', es: v.ref + ' no esta disponible para visitas' }[lang];
var B6 = {
nl: '<p>Bedankt voor uw bezichtigingsaanvraag voor <b>' + esc(v.ref) + '</b>. Deze woning is momenteel onder bod of niet meer in de verkoop, en wordt daarom niet bezichtigd. Mocht de woning weer beschikbaar komen, dan hoort u dat van ons.</p>',
en: '<p>Thank you for your viewing request for <b>' + esc(v.ref) + '</b>. This property is currently under offer or no longer on the market, so no viewings are taking place. Should it become available again, we will let you know.</p>',
es: '<p>Gracias por su solicitud de visita para <b>' + esc(v.ref) + '</b>. Este inmueble esta actualmente reservado o ya no esta a la venta, por lo que no se realizan visitas. Si vuelve a estar disponible, se lo comunicaremos.</p>'
}[lang];
M('not_available', S6, '<p>' + t.hi(agentName) + '</p>' + B6 + box(t.notConf, 'warn') + '<p>' + t.sign + '</p>');
}

if (outcome === 'processed') {
var sub = res.submit || {};
var ok = !!sub.request_id && !sub.error;
if (!ok) outcome = 'nexus_failed';
var p = ctx.property || {};
var repName = p.rep_name || (lang === 'nl' ? 'onze verkoopadviseur' : (lang === 'es' ? 'nuestro asesor' : 'our sales advisor'));
if (ok) {
var S7 = { nl: 'Bezichtigingsaanvraag ' + v.ref + ' ontvangen en doorgestuurd', en: 'Viewing request ' + v.ref + ' received and forwarded', es: 'Solicitud de visita ' + v.ref + ' recibida y transmitida' }[lang];
var keys = {
nl: p.has_keys ? 'Wij hebben de sleutels van deze woning; ' + esc(repName) + ' neemt contact met u op over het ophalen van de sleutels en het bevestigen van de afspraak.' : esc(repName) + ' neemt contact met u op om de afspraak te bevestigen.',
en: p.has_keys ? 'We hold the keys to this property; ' + esc(repName) + ' will contact you about collecting the keys and to confirm the appointment.' : esc(repName) + ' will contact you to confirm the appointment.',
es: p.has_keys ? 'Tenemos las llaves de este inmueble; ' + esc(repName) + ' se pondra en contacto con usted para la recogida de llaves y para confirmar la cita.' : esc(repName) + ' se pondra en contacto con usted para confirmar la cita.'
}[lang];
var B7 = {
nl: '<p>Uw bezichtigingsaanvraag is <b>met succes verwerkt</b> en doorgestuurd naar de verantwoordelijke verkoper uit ons team, <b>' + esc(repName) + '</b>.</p>',
en: '<p>Your viewing request has been <b>processed successfully</b> and forwarded to the responsible sales advisor in our team, <b>' + esc(repName) + '</b>.</p>',
es: '<p>Su solicitud de visita se ha <b>procesado correctamente</b> y se ha transmitido al asesor responsable de nuestro equipo, <b>' + esc(repName) + '</b>.</p>'
}[lang];
var repLine = '<b>' + esc(p.rep_full_name || repName) + '</b>' + (p.rep_email ? '<br><a href="mailto:' + esc(p.rep_email) + '" style="color:#e8231a;text-decoration:none">' + esc(p.rep_email) + '</a>' : '')
+ (p.rep_mobile ? '<br><a href="tel:' + esc(String(p.rep_mobile).replace(/[^0-9+]/g, '')) + '" style="color:#333;text-decoration:none">' + esc(p.rep_mobile) + '</a>' : '');
var F7 = { nl: ['Woning', 'Klant', 'Gewenst', 'Verkoper'], en: ['Property', 'Client', 'Requested', 'Sales advisor'], es: ['Inmueble', 'Cliente', 'Solicitado', 'Asesor'] }[lang];
var NOTE7 = { nl: 'De afspraak zelf is definitief zodra ' + esc(repName) + ' deze met u heeft bevestigd.', en: 'The appointment itself is final once ' + esc(repName) + ' has confirmed it with you.', es: 'La cita sera definitiva cuando ' + esc(repName) + ' la confirme con usted.' }[lang];
M('confirmation', S7, '<p>' + t.hi(agentName) + '</p>' + B7 + box(kv([[F7[0], v.ref + (p.title ? ' · ' + p.title : '') + (p.town ? ' (' + p.town + ')' : '')], [F7[1], client], [F7[2], when], [F7[3], repLine, true]]), 'ok')
+ '<p>' + keys + '</p><p style="font-size:13px;color:#666">' + NOTE7 + '</p><p>' + t.sign + '</p>');
}
var ag = ctx.agent || {};
var confirm = mails[0];
var banner = ok ? '' : box('<b>LET OP: aanmaken in NEXUS is mislukt</b> – de makelaar heeft GEEN bevestiging gekregen. Maak de suspect en aanvraag handmatig aan en neem zelf contact op met de makelaar.<br><span style="font-size:12px;color:#777">' + esc(sub.error || 'geen request_id terug') + '</span>', 'bad');
var inner = banner + '<p style="font-size:16px;font-weight:bold;color:#e8231a;margin-top:0">' + (p.has_keys ? 'WIJ HEBBEN DE SLEUTELS – neem zelf contact op met de makelaar voor sleuteloverdracht en afspraak.' : 'Geen sleutels bij ons – bevestig de afspraak met de makelaar.') + '</p>'
+ kv([['Woning', v.ref + (p.title ? ' · ' + p.title : '') + (p.town ? ' (' + p.town + ')' : '')], ['Klant (suspect)', client], ['Gewenste dag', v.day], ['Gewenste tijd', v.time],
['Makelaar', ag.name || ctx.sender.name], ['Makelaardij', ag.company], ['E-mail makelaar', to],
ctx.channel === 'website' ? ['Bron', 'Makelaarsportaal op de website (gesprek met Sola)'] : null, ctx.channel === 'website' && ag.mobile ? ['Mobiel makelaar', ag.mobile] : null,
['In NEXUS', ok ? (sub.duplicate ? 'bestond al (zelfde mail)' : 'suspect + bezichtigingsaanvraag aangemaakt, aangedragen door de makelaar') : 'MISLUKT']])
+ (ctx.original ? '<div style="margin-top:16px;font-weight:bold">' + (ctx.channel === 'website' ? 'Samenvatting van het gesprek' : 'Oorspronkelijk bericht') + (ctx.original.subject ? ' – ' + esc(ctx.original.subject) : '') + '</div><div style="background:#f4f4f4;border:1px solid #e3e3e3;border-radius:4px;padding:10px;font-size:13px;white-space:pre-wrap">' + esc(ctx.original.body || '') + '</div>' : '')
+ (confirm ? '<div style="margin-top:16px;font-weight:bold">Bevestiging die naar de makelaar ging</div><div style="font-size:12px;color:#777">Onderwerp: ' + esc(confirm.subject) + '</div>' : '')
+ '<p style="font-size:13px;margin-top:16px">Antwoorden op deze mail gaan rechtstreeks naar de makelaar.</p>';
mails.push({ kind: 'rep_notification', to: p.rep_email || 'info@gruposoltura.com', toName: p.rep_name || '', replyTo: to, internal: true,
subject: (ok ? '' : '[ACTIE] ') + 'Bezichtigingsaanvraag ' + v.ref + ' – ' + client + ' – via ' + (ag.company || ag.name || to),
html: wrap(inner, 'nl', true, ctx.channel === 'website') });
}

if (ctx.dry) mails.forEach(function (m) { m.subject = '[TEST → ' + m.to + '] ' + m.subject; m.to = ctx.testEmail || 'rick@gruposoltura.com'; });
return { outcome: outcome, mails: mails, sender: SENDER };
}

return { decide: decide, compose: compose, SENDER: SENDER, REQ_VIEW: REQ_VIEW, REQ_REG: REQ_REG };
})();
