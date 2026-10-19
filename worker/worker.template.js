// Grupo Soltura — Cloudflare Worker voor gruposoltura.com (gratis plan).
// Taken: oude WordPress-URL's en verouderde nieuwe URL's -> 301 naar de echte pagina, partner-exportfeeds transparant doorsturen
// naar Supabase, oude en nieuwe afmeldlinks afhandelen, www en andere domeinen -> https://gruposoltura.com.
// Alle andere verzoeken gaan ongewijzigd door naar GitHub Pages.
// v2 (19-10-2026): echte URL's per taal (/en/..., /nl/...). Doelen komen uit /redirects.json (oude WordPress-paden)
// en /routes.json (uit de nachtelijke build: woning -> canonieke URL, verdwenen woning -> woonplaatsgids).
// GEGENEREERD door scripts/make-worker.mjs uit worker/worker.template.js + js/routes.js + js/resolve.js — niet met de hand bewerken.
// Plakklaar: Cloudflare -> Workers & Pages -> gruposoltura-legacy -> Edit code -> alles vervangen -> Deploy.

const SITE = 'https://gruposoltura.com';
const SB = 'https://wuvpbwowdycsdlrqkaoq.supabase.co';
// Publishable (publieke) sleutel, dezelfde die de website zelf gebruikt; geen geheim.
const SB_KEY = 'sb_publishable_4FzuR1v2uE0VAAH75XgHIQ_o2qEH6n3';
// Optioneel: adres van NEXUS (beheer) voor wie nog /wp-admin opent, bijv. 'https://nexus.solturarealestate.com'.
const NEXUS_URL = '';
// Optioneel: een hostnaam die nog bij de oude WordPress-hosting uitkomt (bijv. 'https://wp.gruposoltura.com'),
// zodat oude foto-links /wp-content/uploads/... blijven werken. Leeg = die links geven 404.
const WP_ORIGIN = '';

/*__SHARED__*/

let MAP = null, MAP_AT = 0, RT = null, RT_AT = 0;
async function loadMap() {
  if (MAP && Date.now() - MAP_AT < 3600e3) return MAP;
  const r = await fetch(SITE + '/redirects.json', { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (r.ok) { MAP = await r.json(); MAP_AT = Date.now(); }
  return MAP || { live: '', tn: [], ts: {}, rt: {}, w: {}, pg: {} };
}
// routes.json verandert bij elke build (nachtelijk en bij publicatie): 10 minuten cache
async function loadRoutes() {
  if (RT && Date.now() - RT_AT < 600e3) return RT;
  try {
    const r = await fetch(SITE + '/routes.json', { cf: { cacheTtl: 600, cacheEverything: true } });
    if (r.ok) { RT = await r.json(); RT_AT = Date.now(); }
  } catch (e) {}
  return RT;
}
async function resolve(path, search) {
  const [M, T] = await Promise.all([loadMap(), loadRoutes()]);
  return solturaResolve(path, search, M, T);
}

const LEGACY_ROOT_QUERY = /(^|&)(p|page_id|post|s|post_type|property|cpr_search)=/i;

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // 1. www.gruposoltura.com, solturarealestate.com e.d. -> https://gruposoltura.com (pad + query blijven, #... houdt de browser zelf)
    if (url.hostname !== 'gruposoltura.com') return Response.redirect(SITE + path + url.search, 301);

    // 2. partner-exportfeeds: zelfde URL als in CPR, inhoud uit Supabase (geen redirect: feedlezers volgen die niet altijd)
    let m = path.match(/^\/wp-json\/contacts-properties-requests\/v1\/exportxml\/[a-z0-9_-]+\/([A-Za-z0-9]{8,64})\/?$/i);
    if (m) return partnerFeed(req, m[1]);
    if (path.startsWith('/wp-json/') || path === '/wp-json' || path.startsWith('/xmlrpc.php'))
      return new Response(JSON.stringify({ code: 'gone', message: 'WordPress is uitgeschakeld' }), { status: 410, headers: { 'content-type': 'application/json' } });

    // 3. afmeldlinks (oud: c=<WordPress-id>, nieuw: c=<uuid>)
    if (/^\/unsubscribe\/?$/i.test(path) || /^\/(nl|en|es)\/unsubscribe\/?$/i.test(path)) return unsubscribe(req, url);

    // 4. WordPress-beheer
    if (/^\/(wp-admin|wp-login\.php)/i.test(path)) return adminMoved();

    // 5. oude foto's
    if (path.startsWith('/wp-content/') && WP_ORIGIN) {
      const r = await fetch(WP_ORIGIN + path + url.search, { headers: { 'user-agent': req.headers.get('user-agent') || '' }, cf: { cacheTtl: 86400, cacheEverything: true } });
      if (r.ok) return new Response(r.body, { status: 200, headers: { 'content-type': r.headers.get('content-type') || 'application/octet-stream', 'cache-control': 'public, max-age=604800' } });
    }

    // 6. homepage met ?lang=nl|en (oude links, ook /?lang=nl#/area/rojales) -> /nl/ of /en/. De browser neemt #... mee;
    //    de app zet een oude hash-route daarna om naar het echte pad.
    if (path === '/' && /(^|&)lang=(nl|en)(&|$)/i.test(url.search.slice(1)) && !LEGACY_ROOT_QUERY.test(url.search.slice(1))) {
      const lang = url.searchParams.get('lang').toLowerCase();
      url.searchParams.delete('lang');
      return Response.redirect(SITE + '/' + lang + '/' + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''), 301);
    }

    // 7. WordPress-shortlinks op de homepage (/?p=123, /?s=..., /?post_type=property)
    if (path === '/' && LEGACY_ROOT_QUERY.test(url.search.slice(1))) {
      const t = await resolve(path, url.search);
      if (t) return Response.redirect(SITE + t, 301);
    }

    // 8. de rest naar GitHub Pages; alleen bij 404 kijken of het een oud of verouderd pad is.
    //    Geen doel gevonden: de 404-pagina van de site (die is de app zelf; een woning die na de laatste build
    //    online kwam, opent daar gewoon).
    const res = await fetch(req);
    if (res.status === 404 && (req.method === 'GET' || req.method === 'HEAD')) {
      const t = await resolve(path, url.search);
      if (t && t !== path) return Response.redirect(SITE + t, 301);
    }
    return res;
  },
};

async function partnerFeed(req, token) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('method not allowed', { status: 405 });
  const r = await fetch(`${SB}/functions/v1/partner-feed/${token}`, {
    method: req.method,
    headers: { 'user-agent': req.headers.get('user-agent') || 'partner-feed-proxy', accept: 'application/xml' },
  });
  const h = new Headers();
  h.set('content-type', r.headers.get('content-type') || 'application/xml; charset=utf-8');
  h.set('cache-control', r.ok ? 'private, max-age=900' : 'no-store');
  h.set('x-robots-tag', 'noindex');
  return new Response(r.body, { status: r.status, headers: h });
}

// ---------- afmelden ----------
const LABEL = {
  market_report: { nl: 'Marktbericht', en: 'Market Report', es: 'Informe de mercado' },
  weekly_top10: { nl: 'Marktbericht', en: 'Market Report', es: 'Informe de mercado' },
  price_reduced: { nl: 'Prijsverlagingen', en: 'Price reductions', es: 'Bajadas de precio' },
  weekly_news: { nl: 'Nieuws', en: 'News', es: 'Noticias' },
  monthly_matches: { nl: 'Aanbod op maat', en: 'Property matches', es: 'Propiedades a tu medida' },
  reserved: { nl: 'Net gereserveerd', en: 'Just reserved', es: 'Reservados' },
  review_invite: { nl: 'Review-uitnodiging', en: 'Review invitation', es: 'Invitación a reseña' },
  review_viewing: { nl: 'Review na bezichtiging', en: 'Post-viewing review', es: 'Reseña tras la visita' },
  new_listing: { nl: 'Nieuw aanbod', en: 'New listings', es: 'Nuevas propiedades' },
  welcome_seller: { nl: 'Verkopersmails', en: 'Seller emails', es: 'Correos para vendedores' },
};
const TXT = {
  nl: { title: 'Uitschrijven', confirm_h: 'Uitschrijven?', confirm_p: 'Klik op de knop hieronder om geen "%s"-e-mails meer te ontvangen van Grupo Soltura.', btn: 'Uitschrijven bevestigen', ok_h: 'Je bent uitgeschreven', ok_p: 'Je ontvangt voortaan geen "%s"-e-mails meer van Grupo Soltura.', bad_h: 'Ongeldige link', bad_p: 'Deze uitschrijflink is ongeldig of verlopen. Ontvang je toch nog ongewenste e-mails? Beantwoord er dan gewoon eentje.', err_h: 'Er ging iets mis', err_p: 'We konden je verzoek nu niet verwerken. Probeer het over een paar minuten opnieuw.', home: 'Naar gruposoltura.com' },
  en: { title: 'Unsubscribe', confirm_h: 'Unsubscribe?', confirm_p: 'Click the button below to stop receiving "%s" emails from Grupo Soltura.', btn: 'Confirm unsubscribe', ok_h: "You're unsubscribed", ok_p: 'You will no longer receive "%s" emails from Grupo Soltura.', bad_h: 'Invalid link', bad_p: 'This unsubscribe link is invalid or has expired. If you keep receiving unwanted emails, just reply to one of them.', err_h: 'Something went wrong', err_p: "We couldn't process your request right now. Please try again in a few minutes.", home: 'Go to gruposoltura.com' },
  es: { title: 'Darse de baja', confirm_h: '¿Darte de baja?', confirm_p: 'Haz clic en el botón para dejar de recibir correos de "%s" de Grupo Soltura.', btn: 'Confirmar baja', ok_h: 'Te has dado de baja', ok_p: 'Ya no recibirás correos de "%s" de Grupo Soltura.', bad_h: 'Enlace no válido', bad_p: 'Este enlace para darse de baja no es válido o ha caducado. Si sigues recibiendo correos no deseados, responde a cualquiera de ellos.', err_h: 'Algo salió mal', err_p: 'No pudimos procesar tu solicitud ahora. Inténtalo de nuevo en unos minutos.', home: 'Ir a gruposoltura.com' },
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function unsubscribe(req, url) {
  const p = Object.fromEntries(url.searchParams);
  if (req.method === 'POST') {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('form')) for (const [k, v] of (await req.formData()).entries()) p[k] = String(v);
  } else if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('method not allowed', { status: 405 });
  const al = (req.headers.get('accept-language') || '').toLowerCase();
  const pl = (url.pathname.match(/^\/(nl|en|es)\//i) || [])[1];
  const lang = ['nl', 'en', 'es'].includes((p.l || pl || '').toLowerCase()) ? (p.l || pl).toLowerCase() : al.startsWith('nl') || al.includes('nl') ? 'nl' : al.startsWith('es') ? 'es' : 'en';
  const T = TXT[lang];
  const label = (LABEL[(p.t || '').toLowerCase()] || {})[lang] || p.t || '';
  if (!p.c || !p.t || !p.s) return page(lang, T.bad_h, T.bad_p, '', 400);

  // GET schrijft nooit (link-prefetch door mailprogramma's mag niemand afmelden); POST = bevestigd of one-click (RFC 8058)
  const apply = req.method === 'POST';
  let r;
  try {
    const res = await fetch(`${SB}/rest/v1/rpc/nexus2_web_unsubscribe`, {
      method: 'POST',
      headers: { apikey: SB_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ p_c: p.c, p_t: p.t, p_s: p.s, p_apply: apply }),
    });
    r = await res.json();
    if (!res.ok) throw new Error('rpc ' + res.status);
  } catch (e) {
    return page(lang, T.err_h, T.err_p, '', 503);
  }
  if (!r || !r.ok) return page(lang, T.bad_h, T.bad_p, '', 400);
  if (apply) return page(lang, T.ok_h, T.ok_p.replace('%s', esc(label)), '', 200);
  const form = `<form method="post" action="/unsubscribe/"><input type="hidden" name="c" value="${esc(p.c)}"><input type="hidden" name="t" value="${esc(p.t)}"><input type="hidden" name="s" value="${esc(p.s)}"><input type="hidden" name="l" value="${lang}"><button type="submit">${esc(T.btn)}</button></form>`;
  return page(lang, T.confirm_h, T.confirm_p.replace('%s', esc(label)), form, 200);
}

function adminMoved() {
  const link = NEXUS_URL ? `<p><a href="${esc(NEXUS_URL)}">Naar NEXUS</a></p>` : '';
  return page('nl', 'WordPress-beheer is uitgeschakeld', 'Woningen, contacten en aanvragen worden nu beheerd in NEXUS.', link, 410);
}

function page(lang, h, msg, extra, status) {
  const T = TXT[lang] || TXT.en;
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(h)} · Grupo Soltura</title>
<style>:root{--bg:#faf7f2;--fg:#1d2a2f;--mu:#5c6b70;--ac:#0f5c63}@media(prefers-color-scheme:dark){:root{--bg:#11181b;--fg:#eef2f2;--mu:#9fb0b3;--ac:#6cc3c9}}
html,body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:34rem;margin:15vh auto 0;padding:0 16px}
h1{font-size:1.4rem;margin:0 0 .6rem}p{color:var(--mu)}a{color:var(--ac);font-weight:600}button{font:inherit;font-weight:600;background:var(--ac);color:var(--bg);border:0;border-radius:10px;padding:.8rem 1.2rem;cursor:pointer;width:100%;max-width:20rem}</style></head>
<body><main><h1>${esc(h)}</h1><p>${msg}</p>${extra}<p><a href="${SITE}/">${esc(T.home)}</a></p></main></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}
