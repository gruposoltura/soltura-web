// GEDEELDE MAILWRAPPER voor alle uitgaande mail van het makelaarsportaal (28-10-2026).
// Volgt de conventie 'Huisstijl uitgaande klantmail' uit de vaultnotitie [[MAIL - mailers en verzendstructuur]];
// referentie-implementatie is JARVIS-Sales-DocumentSender, node Build Email. Byte-gelijk aan die wrapper, op de
// regel 'waarom krijg je deze mail' na (per mailsoort) en zonder afmeldlinks (die horen alleen bij de nieuwsbrief).
//
// Vaste onderdelen: header-banner met link naar de site -> rode balk #E31E24 (links Rojales · Alicante · Spain,
// rechts het kantoornummer vet) -> inhoud -> footer met gruposoltura.com, copyright, adres en de lidmaatschappen
// API / GIPE / CEI / AIPP, daaronder de reden en de privacylink.
// font-family Arial staat op de inhoudscel, op elke <p> en op de footercellen: Gmail negeert de stijl op <body>.
// deno-lint-ignore-file
const HEADER = 'https://res.cloudinary.com/dxmx3a2ea/image/upload/v1792266662/soltura/assets/email/soltura-email-header.jpg';
const TR: Record<string, { rights: string; privacy: string }> = {
  en: { rights: 'All rights reserved.', privacy: 'Privacy Policy' },
  nl: { rights: 'Alle rechten voorbehouden.', privacy: 'Privacybeleid' },
  es: { rights: 'Todos los derechos reservados.', privacy: 'Política de privacidad' },
  sv: { rights: 'Alla rättigheter förbehållna.', privacy: 'Integritetspolicy' },
};
// privacypagina per taal (js/routes.js: en/nl privacy, es privacidad, sv integritet)
const PRIVACY: Record<string, string> = {
  en: 'https://gruposoltura.com/en/privacy/', nl: 'https://gruposoltura.com/nl/privacy/',
  es: 'https://gruposoltura.com/es/privacidad/', sv: 'https://gruposoltura.com/sv/integritet/',
};
const P_STYLE = 'margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#333333';
// Arial op elke <p>: zonder eigen stijl de volledige regel, met eigen stijl ervoor geplakt.
function fonts(html: string) {
  return html.replace(/<p>/g, '<p style="' + P_STYLE + '">').replace(/<p style="(?!font-family)/g, '<p style="font-family:Arial,sans-serif;');
}

export function mailShell(inner: string, lang: string, received: string) {
  const t = TR[lang] || TR.en;
  const privacy = PRIVACY[lang] || PRIVACY.en;
  return '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Soltura Real Estate</title></head>'
    + '<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;overflow:hidden;max-width:600px">'
    + '<tr><td style="padding:0;line-height:0;font-size:0"><a href="https://gruposoltura.com" target="_blank" style="text-decoration:none"><img src="' + HEADER + '" width="600" alt="Grupo Soltura Real Estate - Costa Blanca" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none"></a></td></tr>'
    + '<tr><td style="background:#E31E24;padding:10px 28px"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="color:#ffffff;font-family:Arial,sans-serif;font-size:12px">Rojales &middot; Alicante &middot; Spain</td><td align="right" style="color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;padding-left:12px;white-space:nowrap">+34 966 792 113</td></tr></table></td></tr>'
    + '<tr><td style="padding:32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#333333">' + fonts(inner) + '</td></tr>'
    + '<tr><td style="padding:24px 32px;border-top:1px solid #dddddd;background:#f0f0f0"><table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td align="center" style="padding-bottom:12px"><a href="https://gruposoltura.com" style="color:#e8231a;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;text-decoration:none">gruposoltura.com</a></td></tr>'
    + '<tr><td align="center" style="color:#666666;font-family:Arial,sans-serif;font-size:11px;line-height:1.8">Copyright &copy; ' + new Date().getFullYear() + ' Grupo Soltura S.L. - ' + t.rights + '<br><br>Grupo Soltura S.L.<br>Avd de Constituci&oacute;n s/n<br>03179 Formentera del Segura (ALC)<br><br>Member No. 992 of the Colegio Oficial de Agentes de la Propiedad Inmobiliaria de Alicante (API)<br>Member No. 3.473 of the Asociacion Profesional de Gestores Intermediarios en promociones de<br>Edificaciones (GIPE) y Confederation Europeenne de L&#39;Immobilier (CEI)<br>Member of the Association of International Property Professionals (AIPP)</td></tr>'
    + '<tr><td align="center" style="padding-top:12px;color:#999999;font-family:Arial,sans-serif;font-size:11px;line-height:1.6">' + received + '</td></tr>'
    + '<tr><td align="center" style="padding-top:10px"><a href="' + privacy + '" style="color:#999999;font-family:Arial,sans-serif;font-size:11px;text-decoration:underline">' + t.privacy + '</a></td></tr>'
    + '</table></td></tr></table></td></tr></table></body></html>';
}
