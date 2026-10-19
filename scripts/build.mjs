#!/usr/bin/env node
// Grupo Soltura — statische build voor SEO (besluit 19-10-2026, optie A).
// Leest de publieke views (web_properties, web_town_guides, web_blog_posts) met de publieke sleutel en schrijft naar dist/:
//   - een kopie van de site
//   - per URL (/en/..., /nl/...) een index.html met echte inhoud, unieke title/description, canonical, hreflang,
//     Open Graph en JSON-LD. De app (js/app.js) neemt het daarna over; de inhoud is dezelfde als wat de bezoeker ziet.
//   - sitemap.xml (index) + sitemap-<soort>.xml met hreflang-alternates
//   - routes.json: referentie -> canonieke woning-URL, verdwenen woningen -> woonplaatsgids (voor 404.html en de Worker)
// Faalveiligheid: te weinig woningen t.o.v. de vorige build (< 50%) of een fout in Supabase -> exit 1, de live site blijft staan.
// Gebruik: node scripts/build.mjs [--out dist] [--offline data.json]   (Node 20+, geen dependencies)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = require(path.join(ROOT, 'js/routes.js'));
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = path.resolve(ROOT, arg('--out', 'dist'));
const SITE = (process.env.SITE_URL || 'https://gruposoltura.com').replace(/\/$/, '');
const SB = 'https://wuvpbwowdycsdlrqkaoq.supabase.co';
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_4FzuR1v2uE0VAAH75XgHIQ_o2qEH6n3'; // publiek, dezelfde als de site
const TODAY = new Date().toISOString().slice(0, 10);
const LOGO = 'https://res.cloudinary.com/dxmx3a2ea/image/upload/v1792266661/soltura/assets/brochure/Soltura-logo-345x120-1.png';
const log = (...a) => console.log('[build]', ...a);
const die = (msg) => { console.error('[build] AFGEBROKEN: ' + msg); process.exit(1); };

// ---------- teksten uit de site zelf (i18n.js, pages.js) ----------
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['js/i18n.js', 'js/pages.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const I18N = ctx.I18N, PAGES = ctx.PAGES;
const T = (lang, k, ...a) => { const v = (I18N[lang] || I18N.en)[k] ?? I18N.en[k]; return typeof v === 'function' ? v(...a) : (v ?? ''); };

// ---------- data ----------
async function get(pathq) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SB}/rest/v1/${pathq}`, { headers: { apikey: KEY, 'range-unit': 'items', range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error(`${pathq.split('?')[0]}: HTTP ${r.status}`);
    const rows = await r.json(); out.push(...rows);
    if (rows.length < 1000) return out;
  }
}
const PROP_COLS = 'id,reference,category,is_newbuild,town,suburb,province,price,price_from,previous_price,price_changedate,bedrooms,bathrooms,build_area,plot_area,pool_private,pool_communal,dist_sea_m,year_built,energy_label,orientation,features,terraces,solarium,aircon,image,photos,body_en,body_nl,summary_en,summary_nl,list_date,status,under_offer,featured,is_own,popularity';
async function loadData() {
  const off = arg('--offline');
  if (off) return JSON.parse(fs.readFileSync(off, 'utf8'));
  const [props, guides, posts] = await Promise.all([
    get(`web_properties?select=${PROP_COLS}&order=reference.asc`),
    get('web_town_guides?select=*&order=sort.asc'),
    get('web_blog_posts?select=id,group_id,lang,slug,title,excerpt,body_html,category,source_name,source_url,image_url,published_at&order=published_at.desc.nullslast'),
  ]);
  return { props, guides, posts };
}
async function previous() {
  // vorige build (live): voor de 50%-controle en om verdwenen woningen te onthouden
  if (process.env.PREV_ROUTES === 'none') return null;
  try {
    const r = await fetch(process.env.PREV_ROUTES || SITE + '/routes.json', { headers: { 'cache-control': 'no-cache' } });
    if (r.ok) return await r.json();
  } catch {}
  return null;
}

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const abs = p => SITE + p;
const eur = (n, lang) => n == null ? '' : new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const num = (n, lang) => new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-GB').format(n);
const cut = (s, n = 158) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…'; };
const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const fmtDate = (d, lang) => d ? new Date(d).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const render = (url, w) => url && url.includes('/storage/v1/object/public/') ? url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${w}&quality=72&resize=contain` : url;
// eenvoudige whitelist-sanitizer (zelfde tags als sanitizeRich in de app); inhoud komt uit onze eigen database
function sanitize(html) {
  let h = String(html || '');
  h = h.replace(/<(script|style|iframe|object|embed|noscript|template|form|svg|math)\b[\s\S]*?<\/\1>/gi, '');
  h = h.replace(/<(input|button|link|meta)\b[^>]*>/gi, '');
  h = h.replace(/<h1\b[^>]*>/gi, '<h2>').replace(/<\/h1>/gi, '</h2>');
  const ok = /^(p|strong|b|em|i|br|ul|ol|li|h2|h3|h4|blockquote|a|img|figure|figcaption|hr)$/i;
  return h.replace(/<(\/?)([a-z0-9]+)\b([^>]*)>/gi, (m, close, tag, attrs) => {
    if (!ok.test(tag)) return '';
    tag = tag.toLowerCase();
    if (close) return `</${tag}>`;
    if (tag === 'a') {
      const href = (attrs.match(/\bhref\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
      if (/^https?:/i.test(href)) return `<a href="${esc(href)}" target="_blank" rel="noopener nofollow">`;
      if (/^\/(en|nl)\//.test(href) || /^mailto:/i.test(href)) return `<a href="${esc(href)}">`;
      if (/^#\//.test(href)) return `<a href="${esc(R.fromHash(href, 'en'))}">`;
      return '<a>';
    }
    if (tag === 'img') {
      const src = (attrs.match(/\bsrc\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
      const alt = (attrs.match(/\balt\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
      return /^https:\/\//i.test(src) ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer">` : '';
    }
    return `<${tag}>`;
  });
}
function bodyHtml(body) {
  if (!body) return '';
  body = body.replace(/&amp;(nbsp|amp|quot|apos|lt|gt|#\d+);/g, '&$1;');
  if (!/<(p|br|ul|ol|li|h[2-4])\b/i.test(body)) body = body.split(/\n\s*\n+/).map(x => x.trim()).filter(Boolean).map(x => `<p>${esc(x).replace(/\n/g, '<br>')}</p>`).join('');
  return sanitize(body);
}

// ---------- domein: woningen, gidsen ----------
const stOf = p => p.status && p.status !== 'draft' ? p.status : (p.under_offer ? 'under_offer' : 'available');
const title = (p, lang) => `${R.catName(p.category, lang)} in ${R.placeLabel(p)}`; // zelfde als title() in de app
const guideKeys = g => [g.town, ...(g.aliases || [])].map(R.fold);
function guideFor(p, list) {
  const town = R.fold(p.town), sub = R.fold(p.suburb);
  let best = null, top = 0;
  for (const g of list) { const k = guideKeys(g); const sc = (sub && k.includes(sub) ? 2 : 0) + (town && k.includes(town) ? 1 : 0); if (sc > top) { top = sc; best = g; } }
  return best;
}
const guideHomes = (g, props) => { const k = guideKeys(g); return props.filter(p => p.image && (k.includes(R.fold(p.town)) || (p.suburb && k.includes(R.fold(p.suburb))))); };
const km = (a, b) => { const r = x => x * Math.PI / 180; const d = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2; return 6371 * 2 * Math.asin(Math.sqrt(d)); };
function nearby(g, list, n = 4) {
  if (!g.coords || g.coords.length < 2) return [];
  return list.filter(x => x.slug !== g.slug && x.coords && x.coords.length >= 2).map(x => ({ g: x, km: km(g.coords, x.coords) })).sort((a, b) => a.km - b.km).slice(0, n);
}
// gidsen die binnen een andere gemeente liggen (Ciudad Quesada -> Rojales, Orihuela Costa -> Orihuela)
const PARENT = { 'ciudad-quesada': { name: 'Rojales', slug: 'rojales' }, 'orihuela-costa': { name: 'Orihuela', slug: null } };

// ---------- pagina-sjabloon (index.html van de site zelf) ----------
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let FOOT_GUIDES = { en: '', nl: '' };
function page({ lang, key, path: p, alt, title: ttl, desc, image, jsonld = [], body, noindex = false, ogType = 'website' }) {
  let h = TEMPLATE;
  h = h.replace('<html lang="en">', `<html lang="${lang}">`);
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(ttl)}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  const canonical = abs(p === '/' ? '/en/' : p);
  const head = [
    noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${canonical}">`,
    ...(!noindex && alt ? Object.entries(alt).filter(([, v]) => v).map(([l, v]) => `<link rel="alternate" hreflang="${l}" href="${abs(v)}">`) : []),
    ...(!noindex && alt && alt.en ? [`<link rel="alternate" hreflang="x-default" href="${abs(alt.en)}">`] : []),
    `<meta property="og:type" content="${ogType}">`, `<meta property="og:site_name" content="Grupo Soltura">`,
    `<meta property="og:title" content="${esc(ttl)}">`, `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${canonical}">`, `<meta property="og:locale" content="${lang === 'nl' ? 'nl_NL' : 'en_GB'}">`,
    ...(alt && alt[lang === 'nl' ? 'en' : 'nl'] ? [`<meta property="og:locale:alternate" content="${lang === 'nl' ? 'en_GB' : 'nl_NL'}">`] : []),
    `<meta property="og:image" content="${esc(image || LOGO)}">`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    ...jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].join('\n');
  h = h.replace('</head>', head + '\n</head>');
  // kop en voet in de taal van de pagina, met echte links
  h = h.replace(/(<a class="logo" href=")[^"]*(")/, `$1${R.href(lang, 'home')}$2`);
  h = h.replace(/(<a class="fav-link" href=")[^"]*(")/, `$1${R.href(lang, 'favorites')}$2`);
  h = h.replace(/<a href="[^"]*" data-route="(\w+)"( data-t="\w+")?>/g, (m, r, dt) => `<a href="${R.href(lang, r)}" data-route="${r}"${dt || ''}${(key === 'guide' ? 'area' : key) === r ? ' aria-current="page"' : ''}>`);
  h = h.replace(/href="[^"]*" data-href="(\w+)"/g, (m, r) => `href="${R.href(lang, r)}" data-href="${r}"`);
  h = h.replace(/(data-t="(\w+)"[^>]*>)([^<]*)(<)/g, (m, a, k, txt, b) => { const v = T(lang, k); return a + (typeof v === 'string' && v ? esc(v) : txt) + b; });
  h = h.replace('<a class="skip" href="#main">Skip to content</a>', `<a class="skip" href="#main">${lang === 'nl' ? 'Naar de inhoud' : 'Skip to content'}</a>`);
  h = h.replace('<main id="main"></main>', `<main id="main">${body}</main>`);
  h = h.replace('<div class="foot-grid">', `<div class="foot-grid">\n    <nav class="foot-areas" aria-label="${esc(T(lang, 'nav_areas'))}"><p><b data-t="nav_areas">${esc(T(lang, 'nav_areas'))}</b></p><p>${FOOT_GUIDES[lang]}</p></nav>`);
  return h;
}

// ---------- inhoud per paginatype (zelfde teksten en opbouw als de app) ----------
function cardHtml(p, lang) {
  const t = title(p, lang), st = stOf(p);
  const specs = [p.bedrooms && `${p.bedrooms} ${T(lang, 'sh_bed').toLowerCase()}`, p.bathrooms && `${p.bathrooms} ${T(lang, 'sh_bath').toLowerCase()}`, p.build_area && `${num(p.build_area, lang)} m²`, p.plot_area && `${num(p.plot_area, lang)} m² ${lang === 'nl' ? 'perceel' : 'plot'}`].filter(Boolean).join(' · ');
  return `<a class="card st-card-${st}" href="${R.href(lang, 'property', p)}">
    <div class="ph">${p.image ? `<img src="${esc(render(p.image, 640))}" alt="${esc(t)}" loading="lazy" decoding="async">` : ''}<span class="ref-tag">${esc(p.reference)}</span>${st !== 'available' ? `<span class="st st-${st}"><i></i>${esc(T(lang, 'st_' + st))}</span>` : ''}</div>
    <div class="meta"><div class="price">${p.price == null ? (lang === 'nl' ? 'Prijs op aanvraag' : 'Price on request') : (p.price_from ? `<small>${esc(T(lang, 'from'))}</small>` : '') + eur(p.price, lang)}</div><h3>${esc(t)}</h3><div class="specs">${esc(specs)}</div></div></a>`;
}
const order = props => [...props].sort((a, b) => ((a.is_own ? 0 : 1) - (b.is_own ? 0 : 1)) || ((b.featured ? 1 : 0) - (a.featured ? 1 : 0)) || String(b.list_date || '').localeCompare(String(a.list_date || '')));
const timeline = steps => `<ol class="tl">${steps.map(([h, p], i) => `<li><span class="tl-n">${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol>`;
const homesRail = (props, lang, h) => { const items = order(props.filter(p => p.image && stOf(p) === 'available')).slice(0, 12); return items.length ? `<section class="section"><h2>${esc(h || T(lang, 'home_rail'))}</h2><div class="rail">${items.map(p => cardHtml(p, lang)).join('')}</div><p><a class="btn ghost" href="${R.href(lang, 'home')}">${esc(T(lang, 'see_all'))}</a></p></section>` : ''; };

function bodyHome(lang, props, guides) {
  const list = order(props);
  return `<section class="hero"><div class="hero-body"><h1>${esc(T(lang, 'hero_title'))}</h1><p class="sub">${esc(T(lang, 'hero_sub'))}</p><p class="live-count"><b>${list.length}</b> ${esc(T(lang, 'live'))}</p></div></section>
  <section class="feed" id="feed">${list.slice(0, 24).map(p => cardHtml(p, lang)).join('')}</section>
  <section class="section"><h2>${esc(T(lang, 'areas_h'))}</h2><ul class="link-list">${guides.map(g => `<li><a href="${R.href(lang, 'guide', g.slug)}">${esc(g.title)}</a></li>`).join('')}</ul></section>`;
}
function bodyBuy(lang, props) {
  const c = PAGES[lang].buy;
  return `<section class="page-hero short"><div><p class="kicker">${esc(T(lang, 'nav_buy'))}</p><h1>${c.h}</h1><p>${c.lead}</p><p class="hero-acts"><a class="btn lemon" href="${R.href(lang, 'home')}">${esc(T(lang, 'see_all'))}</a></p></div></section>
  <div class="pg"><p class="pg-intro">${c.intro}</p><div class="buy-grid"><div><h2 class="pg-h">${c.steps_h}</h2>${timeline(c.steps)}</div>
  <aside class="box costs-card"><h2>${c.costs_h}</h2><ul class="ticks">${c.costs.map(x => `<li>${x}</li>`).join('')}</ul><div class="allin-note">${c.costs_note}</div></aside></div>
  <div class="box fin-card"><h3>${c.fin_h}</h3><p>${c.fin_p}</p></div>
  <h2 class="pg-h">${c.services_h}</h2><ul class="svc">${c.services.map(x => `<li><span>${x}</span></li>`).join('')}</ul></div>${homesRail(props, lang)}`;
}
function bodySell(lang) {
  const c = PAGES[lang].sell;
  return `<section class="page-hero"><div><p class="kicker">${esc(T(lang, 'nav_sell'))}</p><h1>${c.h}</h1><p>${c.lead}</p></div></section>
  <div class="pg"><div class="feats">${c.feats.map(([h, p]) => `<div class="feat"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
  <div class="pg-2 tight"><div><h2 class="pg-h">${c.steps_h}</h2>${timeline(c.steps)}</div><div class="box form-card"><h2>${c.form_h}</h2><p>${c.form_p}</p></div></div>
  <div class="cta-band"><p>${c.legal}</p><a class="btn ghost" href="${R.href(lang, 'contact')}">${esc(T(lang, 'nav_contact'))}</a></div></div>`;
}
function bodyMove(lang, props) {
  const c = PAGES[lang].move;
  return `<section class="page-hero"><div><p class="kicker">${esc(T(lang, 'nav_move'))}</p><h1>${c.h}</h1><p>${c.lead}</p></div></section>
  <div class="pg"><div class="stages">${c.stages.map(([h, p], i) => `<div class="stage"><span>${i + 1}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
  <p class="move-areas"><a href="${R.href(lang, 'area')}">${esc(T(lang, 'areas_h'))}</a></p>
  <div class="acc">${c.topics.map(([h, p]) => `<details open><summary>${h}</summary><p>${p}</p></details>`).join('')}<p class="disclaimer">${c.disclaimer}</p></div>
  <aside class="box side-cta"><h2>${c.form_h}</h2><p>${c.form_p}</p></aside></div>${homesRail(props, lang)}`;
}
function bodyPrivacy(lang) {
  const c = PAGES[lang].privacy;
  return `<div class="page-head"><p class="kicker">Grupo Soltura SL</p><h1>${c.h}</h1><p class="muted">${c.updated}</p></div>
  <div class="pg privacy"><div class="pv-body">${c.sections.map(([h, p], i) => `<section id="pv${i}"><h2>${h}</h2><p>${p}</p></section>`).join('')}</div></div>`;
}
const AGENTS = [['Rick van Hoeven', 'Partner, Sales', '+34664414515'], ['Marco Verschoor', 'Partner, Sales', '+34670687341'], ['Ingrid van Hoeven', '(After) Sales', '+34664414668'], ['Lisette Don', '(After) Sales', '+34662226338']];
function bodyContact(lang) {
  const fmt = tel => tel.replace(/(\+34)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  return `<section class="page-hero contact-hero"><div><p class="kicker">${esc(T(lang, 'nav_contact'))}</p><h1>${esc(T(lang, 'contact_h'))}</h1><p>${esc(T(lang, 'contact_p'))}</p></div></section>
  <div class="pg contact-grid"><div>
    <div class="ways"><a class="way wa" href="https://wa.me/34664414515"><b>WhatsApp</b><span>+34 664 414 515</span></a><a class="way" href="tel:+34966792113"><b>+34 966 792 113</b></a><a class="way" href="mailto:info@gruposoltura.com"><b>info@gruposoltura.com</b></a></div>
    <div class="map-info"><h2>${esc(T(lang, 'office'))}</h2><p>Grupo Soltura Real Estate<br>Avda. de la Constitución s/n<br>03179 Formentera del Segura, Alicante</p><p class="muted">${esc(T(lang, 'hours'))}</p></div>
    <h2 class="pg-h">${esc(T(lang, 'c_team'))}</h2><div class="team-cards">${AGENTS.map(([n, r, tel]) => `<div class="tm"><div><b>${n}</b><span>${r}</span><p><a href="tel:${tel}">${fmt(tel)}</a></p></div></div>`).join('')}</div>
    <p class="muted">${esc(T(lang, 'foot_reg'))}</p>
  </div></div>`;
}
function bodyAreas(lang, guides, props) {
  return `<section class="page-hero short area-hero"><div><p class="kicker">${esc(T(lang, 'nav_areas'))}</p><h1>${esc(T(lang, 'areas_h'))}</h1><p>${esc(T(lang, 'areas_p'))}</p></div></section>
  <div class="pg"><p class="pg-intro">${esc(T(lang, 'areas_intro'))}</p><div class="area-grid" id="areaGrid">${guides.map(g => {
    const n = guideHomes(g, props).length, ph = (g.photos || [])[0];
    return `<a class="area-card" href="${R.href(lang, 'guide', g.slug)}">${ph ? `<span class="ac-img"><img src="${esc(render(ph.url, 640))}" alt="${esc(ph.alt || g.town)}" loading="lazy"></span>` : '<span class="ac-img"></span>'}<span class="ac-txt"><h3>${esc(g.town)}</h3><p>${esc(g.lead || '')}</p>${n ? `<small>${esc(T(lang, 'areas_n', n))}</small>` : ''}</span></a>`;
  }).join('')}</div></div>`;
}
function bodyGuide(lang, g, guides, props) {
  const nl = lang === 'nl';
  const secs = (g.sections || []).filter(s => s && (s.html || (s.rows && s.rows.length)));
  const photos = g.photos || [], homes = guideHomes(g, props);
  const table = s => `<div class="tbl-wrap"><table class="area-tbl${s.key === 'festivals' ? ' fest' : ''}">${s.key === 'festivals' ? `<thead><tr><th>${nl ? 'Feest' : 'Festival'}</th><th>${nl ? 'Wanneer' : 'When'}</th><th>${nl ? 'Wat' : 'What'}</th></tr></thead>` : ''}<tbody>${s.rows.map(r => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="k"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const near = nearby(g, guides);
  return `<section class="page-hero short area-hero">${photos[0] ? `<img class="hero-kb" src="${esc(render(photos[0].url, 1800))}" alt="" aria-hidden="true">` : ''}<div>
    <nav class="kicker crumbs" aria-label="Breadcrumb"><a href="${R.href(lang, 'home')}">Grupo Soltura</a> › <a href="${R.href(lang, 'area')}">${esc(T(lang, 'nav_areas'))}</a></nav>
    <h1>${esc(g.title)}</h1>${g.lead ? `<p>${esc(g.lead)}</p>` : ''}</div></section>
  <div class="pg area-pg">
    ${(g.facts || []).length ? `<dl class="area-facts">${g.facts.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>` : ''}
    <div class="post-body area-body">${secs.map(s => `<section id="sec-${esc(s.key)}"><h2 class="pg-h">${esc(s.heading)}</h2>${s.rows ? table(s) : sanitize(s.html)}</section>`).join('')}</div>
    ${near.length ? `<section class="area-near"><h2 class="pg-h">${nl ? 'In de buurt' : 'Nearby'}</h2><ul class="near-list">${near.map(x => `<li><a href="${R.href(lang, 'guide', x.g.slug)}">${esc(x.g.town)}</a> <small>${Math.round(x.km)} km</small></li>`).join('')}</ul></section>` : ''}
    <details class="area-src"><summary>${nl ? 'Bronnen en foto\'s' : 'Sources and photos'}</summary><ul>${(g.sources || []).filter(x => x && /^https?:/i.test(x.url || '')).map(x => `<li><a href="${esc(x.url)}" rel="noopener nofollow">${esc(x.title || new URL(x.url).hostname)}</a></li>`).join('')}</ul>
      ${photos.length ? `<p class="muted">${nl ? 'Foto\'s via Wikimedia Commons' : 'Photos via Wikimedia Commons'}: ${photos.map(ph => `${esc(ph.author || 'Wikimedia Commons')}, <a href="${esc(ph.page_url)}" rel="noopener nofollow">${esc(ph.license)}</a>`).join(' · ')}</p>` : ''}</details>
  </div>
  ${homes.length ? `<section class="section"><h2>${esc(T(lang, 'area_h', g.town))}</h2><div class="rail">${order(homes).slice(0, 24).map(p => cardHtml(p, lang)).join('')}</div></section>` : homesRail(props, lang)}`;
}
function bodyProperty(lang, p, guide) {
  const nl = lang === 'nl', t = title(p, lang), st = stOf(p);
  const body = bodyHtml(nl ? (p.body_nl || p.body_en) : (p.body_en || p.body_nl)) || (p.summary_en ? `<p>${esc(nl ? (p.summary_nl || p.summary_en) : p.summary_en)}</p>` : '');
  const facts = [[p.bedrooms, T(lang, 'sh_bed')], [p.bathrooms, T(lang, 'sh_bath')], [p.build_area && num(p.build_area, lang) + ' m²', T(lang, 'sh_built')], [p.plot_area && num(p.plot_area, lang) + ' m²', T(lang, 'sh_plot')], [p.year_built, T(lang, 'sh_year')], [p.energy_label && p.energy_label !== 'R' ? p.energy_label : null, T(lang, 'sh_energy')]].filter(x => x[0] != null && x[0] !== '');
  const feats = [];
  if (p.pool_private) feats.push(T(lang, 'pool_private')); if (p.pool_communal) feats.push(T(lang, 'pool_communal'));
  if (p.aircon) feats.push(T(lang, 'aircon')); if (p.solarium) feats.push(T(lang, 'solarium'));
  (p.features || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => feats.push(s.charAt(0).toUpperCase() + s.slice(1)));
  const photos = [...new Set([p.image, ...(p.photos || [])].filter(Boolean))].slice(0, 12);
  return `<article class="prop-static">
    <nav class="kicker crumbs" aria-label="Breadcrumb"><a href="${R.href(lang, 'home')}">${esc(T(lang, 'nav_homes'))}</a>${guide ? ` › <a href="${R.href(lang, 'guide', guide.slug)}">${esc(guide.town)}</a>` : ''} › ${esc(p.reference)}</nav>
    <h1>${esc(t)}</h1>
    <p class="sh-price">${st !== 'available' ? `<span class="st st-${st} big"><i></i>${esc(T(lang, 'st_' + st))}</span> ` : ''}${p.price_from ? `<small>${esc(T(lang, 'from'))}</small> ` : ''}${p.price != null ? eur(p.price, lang) : (nl ? 'Prijs op aanvraag' : 'Price on request')}</p>
    <p class="ref">${esc(T(lang, 'sh_ref'))} ${esc(p.reference)}</p>
    ${photos.length ? `<div class="gal-static">${photos.map((u, i) => `<img src="${esc(render(u, i ? 900 : 1600) || u)}" alt="${esc(t)}${i ? ' – ' + (i + 1) : ''}"${i ? ' loading="lazy"' : ''}>`).join('')}</div>` : ''}
    ${facts.length ? `<dl class="keyfacts">${facts.map(([v, l]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${body ? `<section class="desc"><h2>${esc(T(lang, 'desc_h'))}</h2>${body}</section>` : ''}
    ${feats.length ? `<section class="feat"><h2>${esc(T(lang, 'feat_h'))}</h2><ul>${[...new Set(feats)].map(f => `<li>${esc(f)}</li>`).join('')}</ul></section>` : ''}
    ${guide ? `<p><a class="area-link" href="${R.href(lang, 'guide', guide.slug)}"><b>${esc(T(lang, 'areas_link_h', guide.town))}</b> <small>${esc(T(lang, 'areas_link_p'))}</small></a></p>` : ''}
    <p><a class="btn wa" href="https://wa.me/34664414515">WhatsApp</a> <a class="btn ghost" href="tel:+34966792113">+34 966 792 113</a> <a class="btn ghost" href="${R.href(lang, 'home')}">${esc(T(lang, 'see_all'))}</a></p>
  </article>`;
}
function bodyNews(lang, list) {
  return `<div class="page-head"><p class="kicker">${esc(T(lang, 'nav_news'))}</p><h1>${esc(T(lang, 'news_h'))}</h1><p>${esc(T(lang, 'news_p'))}</p></div>
  <div class="news-grid" id="newsList">${list.map(r => `<a class="news-card${r.image_url ? ' has-img' : ''}" href="${R.href(r.lang, 'news', r.slug)}">${r.image_url ? `<span class="nc-img"><img src="${esc(r.image_url)}" alt="" loading="lazy" referrerpolicy="no-referrer"></span>` : ''}<span class="nc-txt"><h3>${esc(r.title)}</h3>${r.excerpt ? `<p class="nc-ex">${esc(r.excerpt)}</p>` : ''}<small>${r.source_name ? esc(r.source_name) + ' · ' : ''}${fmtDate(r.published_at, lang)}</small></span></a>`).join('')}</div>`;
}
function bodyPost(lang, r) {
  const nl = lang === 'nl';
  return `<article class="post"><p class="kicker"><a href="${R.href(lang, 'news')}">← ${esc(T(lang, 'nav_news'))}</a></p><h1>${esc(r.title)}</h1>
    <p class="post-meta muted"><time datetime="${esc(r.published_at || '')}">${fmtDate(r.published_at, lang)}</time>${r.source_name ? ' · ' + esc(r.source_name) : ''}</p>
    ${r.image_url ? `<figure class="post-img"><img src="${esc(r.image_url)}" alt="" referrerpolicy="no-referrer"></figure>` : ''}
    ${r.excerpt ? `<p class="post-lead">${esc(r.excerpt)}</p>` : ''}<div class="post-body">${sanitize(r.body_html)}</div>
    ${r.source_url && /^https?:/i.test(r.source_url) ? `<p class="post-src">${nl ? 'Bron' : 'Source'}: <a href="${esc(r.source_url)}" rel="noopener nofollow">${esc(r.source_name || new URL(r.source_url).hostname)}</a></p>` : ''}</article>`;
}

// ---------- JSON-LD ----------
const ORG = {
  '@type': 'RealEstateAgent', '@id': SITE + '/#org', name: 'Grupo Soltura SL', alternateName: 'Soltura Real Estate', url: SITE + '/', logo: LOGO, image: LOGO,
  telephone: '+34 966 792 113', email: 'info@gruposoltura.com', foundingDate: '2002',
  address: { '@type': 'PostalAddress', streetAddress: 'Avda. de la Constitución s/n', postalCode: '03179', addressLocality: 'Formentera del Segura', addressRegion: 'Alicante', addressCountry: 'ES' },
  geo: { '@type': 'GeoCoordinates', latitude: 38.0871507, longitude: -0.7407113 },
  areaServed: 'Vega Baja del Segura, Costa Blanca',
  sameAs: ['https://www.facebook.com/gruposoltura/', 'https://www.instagram.com/gruposoltura/', 'https://www.youtube.com/channel/UCHCCVUmkLEctwVhjRKEp7AQ'],
};
const ld = o => Object.assign({ '@context': 'https://schema.org' }, o);
const crumbs = items => ld({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) });

// ---------- schrijven ----------
const written = [];
function write(p, html) {
  const file = path.join(OUT, p.replace(/^\//, ''), p.endsWith('/') ? 'index.html' : '');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written.push(p);
}
function copySite() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const skip = new Set(['.git', '.github', 'dist', 'scripts', 'supabase', 'node_modules', 'README.md', 'sitemap.xml', 'test']);
  for (const e of fs.readdirSync(ROOT)) { if (skip.has(e) || e === path.basename(OUT)) continue; fs.cpSync(path.join(ROOT, e), path.join(OUT, e), { recursive: true }); }
}

async function main() {
  let data;
  try { data = await loadData(); } catch (e) { die('Supabase niet bereikbaar of fout: ' + e.message); }
  const { props, guides: allGuides, posts } = data;
  const prev = await previous();
  const prevN = prev && prev.props ? Object.keys(prev.props).length : 0;
  log(`woningen ${props.length} (vorige build ${prevN || 'onbekend'}), gidsen ${allGuides.length}, berichten ${posts.length}`);
  if (props.length < 50 && prevN >= 50) die(`slechts ${props.length} woningen`);
  if (prevN && props.length < prevN * 0.5) die(`${props.length} woningen is minder dan 50% van de vorige build (${prevN})`);
  const G = { en: allGuides.filter(g => g.lang === 'en'), nl: allGuides.filter(g => g.lang === 'nl') };
  if (!G.en.length || !G.nl.length) die('geen woonplaatsgidsen ontvangen');
  for (const l of ['en', 'nl']) FOOT_GUIDES[l] = G[l].map(g => `<a href="${R.href(l, 'guide', g.slug)}" data-guide="${esc(g.slug)}">${esc(g.town)}</a>`).join(' · ');

  copySite();
  const sm = { pages: [], areas: [], homes: [], news: [] }; // [{alt:{en,nl}, lastmod}]
  const both = key => ({ en: R.href('en', key), nl: R.href('nl', key) });
  const lastProp = props.map(p => p.price_changedate || p.list_date).filter(Boolean).sort().pop()?.slice(0, 10) || TODAY;

  // vaste pagina's
  const fixed = [
    ['home', l => ({ title: l === 'nl' ? 'Grupo Soltura · Woningen te koop aan de Costa Blanca' : 'Grupo Soltura · Homes for sale on the Costa Blanca', desc: l === 'nl' ? 'Lokale experts sinds 2002. Bekijk al onze woningen te koop in de Vega Baja en aan de zuidelijke Costa Blanca, stel vragen per woning en spreek het team direct.' : 'Local experts since 2002. Browse every home we offer in the Vega Baja and on the southern Costa Blanca, ask questions about any listing and talk to the team directly.', body: bodyHome(l, props, G[l]), jsonld: [ld(ORG), ld({ '@type': 'WebSite', name: 'Grupo Soltura', url: SITE + '/', inLanguage: l })], lastmod: lastProp })],
    ['buy', l => ({ title: `${strip(PAGES[l].buy.h)} · Grupo Soltura`, desc: cut(strip(PAGES[l].buy.lead + ' ' + PAGES[l].buy.intro)), body: bodyBuy(l, props) })],
    ['sell', l => ({ title: `${strip(PAGES[l].sell.h)} · Grupo Soltura`, desc: cut(strip(PAGES[l].sell.lead)), body: bodySell(l) })],
    ['move', l => ({ title: `${strip(PAGES[l].move.h)} · Grupo Soltura`, desc: cut(strip(PAGES[l].move.lead)), body: bodyMove(l, props) })],
    ['area', l => ({ title: `${T(l, 'areas_h')} · Grupo Soltura`, desc: cut(T(l, 'areas_p')), body: bodyAreas(l, G[l], props), lastmod: G[l].map(g => g.updated_at).sort().pop()?.slice(0, 10) })],
    ['contact', l => ({ title: `${T(l, 'contact_h')} · Grupo Soltura`, desc: cut(T(l, 'contact_p') + ' Avda. de la Constitución s/n, 03179 Formentera del Segura. +34 966 792 113.'), body: bodyContact(l), jsonld: [ld(ORG)] })],
    ['privacy', l => ({ title: `${strip(PAGES[l].privacy.h)} · Grupo Soltura`, desc: cut(strip(PAGES[l].privacy.sections[0][1])), body: bodyPrivacy(l) })],
  ];
  for (const [key, fnc] of fixed) {
    const alt = both(key);
    for (const l of ['en', 'nl']) {
      const c = fnc(l);
      const jsonld = [...(c.jsonld || []), ...(key === 'home' ? [] : [crumbs([['Grupo Soltura', R.href(l, 'home')], [strip(c.title.split(' · ')[0]), R.href(l, key)]])])];
      const html = page({ lang: l, key, path: alt[l], alt, title: c.title, desc: c.desc, jsonld, body: c.body });
      write(alt[l], html);
      if (key === 'home' && l === 'en') write('/', html);
    }
    sm.pages.push({ alt, lastmod: fnc('en').lastmod || TODAY });
  }
  // favorieten: persoonlijk, niet indexeren
  for (const l of ['en', 'nl']) write(R.href(l, 'favorites'), page({ lang: l, key: 'favorites', path: R.href(l, 'favorites'), title: `${T(l, 'fav_h')} · Grupo Soltura`, desc: T(l, 'fav_h'), noindex: true, body: `<div class="page-head"><h1>${esc(T(l, 'fav_h'))}</h1></div>` }));

  // woonplaatsgidsen
  for (const g of G.en) {
    const alt = { en: R.href('en', 'guide', g.slug), nl: G.nl.some(x => x.slug === g.slug) ? R.href('nl', 'guide', g.slug) : null };
    for (const l of ['en', 'nl']) {
      const gl = G[l].find(x => x.slug === g.slug); if (!gl) continue;
      const ph = (gl.photos || [])[0];
      const par = PARENT[gl.slug];
      const place = ld({ '@type': 'Place', name: gl.town, url: abs(alt[l]), description: gl.lead || undefined,
        ...(gl.coords && gl.coords.length >= 2 ? { geo: { '@type': 'GeoCoordinates', latitude: gl.coords[0], longitude: gl.coords[1] } } : {}),
        ...(ph ? { image: render(ph.url, 1200) } : {}),
        containedInPlace: par ? { '@type': 'Place', name: par.name, ...(par.slug ? { url: abs(R.href(l, 'guide', par.slug)) } : {}) } : { '@type': 'AdministrativeArea', name: 'Vega Baja del Segura, Alicante, Spain' } });
      write(alt[l], page({ lang: l, key: 'guide', path: alt[l], alt, title: `${gl.title} · Grupo Soltura`, desc: cut(gl.lead || gl.title), image: ph ? render(ph.url, 1200) : null,
        jsonld: [crumbs([['Grupo Soltura', R.href(l, 'home')], [T(l, 'nav_areas'), R.href(l, 'area')], [gl.town, alt[l]]]), place], body: bodyGuide(l, gl, G[l], props) }));
    }
    sm.areas.push({ alt, lastmod: (g.updated_at || TODAY).slice(0, 10) });
  }

  // woningen
  const routes = { v: TODAY, props: {}, gone: {}, guides: {}, towns: {} };
  for (const p of props) {
    const guide = { en: guideFor(p, G.en), nl: guideFor(p, G.nl) };
    const alt = { en: R.href('en', 'property', p), nl: R.href('nl', 'property', p) };
    for (const l of ['en', 'nl']) {
      const t = title(p, l), img = p.image ? render(p.image, 1200) : null, gd = guide[l];
      const summary = l === 'nl' ? (p.summary_nl || p.summary_en) : p.summary_en;
      const desc = cut(`${t}${p.price != null ? ' · ' + eur(p.price, l) : ''}. ${summary || strip(l === 'nl' ? (p.body_nl || p.body_en) : (p.body_en || p.body_nl))}`);
      const avail = { available: 'https://schema.org/InStock', under_offer: 'https://schema.org/LimitedAvailability', reserved: 'https://schema.org/LimitedAvailability', sold: 'https://schema.org/SoldOut' }[stOf(p)] || 'https://schema.org/InStock';
      const listing = ld({ '@type': 'RealEstateListing', name: `${t} · ${p.reference}`, url: abs(alt[l]), inLanguage: l, datePosted: p.list_date || undefined,
        image: [...new Set([p.image, ...(p.photos || [])].filter(Boolean))].slice(0, 6).map(u => render(u, 1200)),
        description: summary || undefined,
        offers: p.price != null ? { '@type': 'Offer', price: Number(p.price), priceCurrency: 'EUR', availability: avail, seller: { '@id': SITE + '/#org' } } : undefined,
        about: { '@type': 'Accommodation', name: t, numberOfBedrooms: p.bedrooms || undefined, numberOfBathroomsTotal: p.bathrooms || undefined,
          floorSize: p.build_area ? { '@type': 'QuantitativeValue', value: Number(p.build_area), unitCode: 'MTK' } : undefined,
          address: { '@type': 'PostalAddress', addressLocality: R.placeLabel(p), addressRegion: p.province || 'Alicante', addressCountry: 'ES' } } });
      const cr = crumbs([[T(l, 'nav_homes'), R.href(l, 'home')], ...(gd ? [[gd.town, R.href(l, 'guide', gd.slug)]] : []), [`${t} · ${p.reference}`, alt[l]]]);
      write(alt[l], page({ lang: l, key: 'property', path: alt[l], alt, title: `${t} ${stOf(p) === 'sold' ? (l === 'nl' ? '(verkocht)' : '(sold)') : (l === 'nl' ? 'te koop' : 'for sale')} · ${p.reference} · Grupo Soltura`, desc, image: img, ogType: 'product', jsonld: [cr, listing], body: bodyProperty(l, p, gd) }));
    }
    routes.props[p.reference.toUpperCase()] = { en: alt.en, nl: alt.nl, g: guide.en ? guide.en.slug : null };
    sm.homes.push({ alt, lastmod: (p.price_changedate || p.list_date || TODAY).slice(0, 10) });
  }
  // verdwenen woningen onthouden (301 naar de gids van hun plaats, anders het aanbod)
  if (prev) {
    for (const [ref, v] of Object.entries(prev.gone || {})) if (!routes.props[ref]) routes.gone[ref] = v;
    for (const [ref, v] of Object.entries(prev.props || {})) if (!routes.props[ref]) routes.gone[ref] = v.g || null;
  }
  for (const g of G.en) { routes.guides[g.slug] = 1; for (const k of guideKeys(g)) if (!routes.towns[k] || R.fold(g.town) === k) routes.towns[k] = g.slug; }

  // nieuws: per taal eigen slug, vertaling via group_id
  const byGroup = new Map(); posts.forEach(r => { const k = r.group_id || r.id; if (!byGroup.has(k)) byGroup.set(k, []); byGroup.get(k).push(r); });
  for (const r of posts) {
    const l = (r.lang || '').toLowerCase(); if (l !== 'en' && l !== 'nl') continue;
    const sibs = byGroup.get(r.group_id || r.id) || [];
    const alt = {}; sibs.forEach(s => { const sl = (s.lang || '').toLowerCase(); if ((sl === 'en' || sl === 'nl') && !alt[sl]) alt[sl] = R.href(sl, 'news', s.slug); });
    const p = R.href(l, 'news', r.slug);
    const art = ld({ '@type': 'NewsArticle', headline: cut(r.title, 110), description: r.excerpt || undefined, datePublished: r.published_at || undefined, inLanguage: l, url: abs(p),
      image: r.image_url ? [r.image_url] : undefined, publisher: { '@id': SITE + '/#org', '@type': 'Organization', name: 'Grupo Soltura', logo: { '@type': 'ImageObject', url: LOGO } },
      ...(r.source_url && /^https?:/i.test(r.source_url) ? { isBasedOn: r.source_url } : {}) });
    write(p, page({ lang: l, key: 'news', path: p, alt, title: `${r.title} · Grupo Soltura`, desc: cut(r.excerpt || strip(r.body_html)), image: r.image_url || null, ogType: 'article',
      jsonld: [crumbs([['Grupo Soltura', R.href(l, 'home')], [T(l, 'nav_news'), R.href(l, 'news')], [cut(r.title, 80), p]]), art], body: bodyPost(l, r) }));
    if (!sm.news.some(x => x.alt[l] === p)) sm.news.push({ alt, lastmod: (r.published_at || TODAY).slice(0, 10) });
  }
  const newsAlt = both('news');
  for (const l of ['en', 'nl']) {
    const list = [...byGroup.values()].map(g => g.find(r => (r.lang || '').toLowerCase() === l) || g[0]).filter(r => ['en', 'nl'].includes((r.lang || '').toLowerCase()))
      .sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || ''))).slice(0, 60);
    write(newsAlt[l], page({ lang: l, key: 'news', path: newsAlt[l], alt: newsAlt, title: `${T(l, 'news_h')} · Grupo Soltura`, desc: cut(T(l, 'news_p')), body: bodyNews(l, list),
      jsonld: [crumbs([['Grupo Soltura', R.href(l, 'home')], [T(l, 'nav_news'), newsAlt[l]]])] }));
  }
  sm.pages.push({ alt: newsAlt, lastmod: (posts[0] && posts[0].published_at || TODAY).slice(0, 10) });

  // 404.html = de app in de site-layout (noindex). Eerst kijken of het een oud of verouderd pad is (zelfde resolver als de Worker);
  // zo niet, dan draait de app: een woning die na de laatste build is gepubliceerd opent gewoon, een onbekend pad toont 'bestaat niet'.
  const RESOLVE = `<script src="/js/routes.js"></script><script src="/js/resolve.js"></script><script>(function(){var g=function(u){return fetch(u).then(function(r){return r.ok?r.json():null}).catch(function(){return null})};Promise.all([g('/redirects.json'),g('/routes.json')]).then(function(x){var t=null;try{t=solturaResolve(location.pathname,location.search,x[0]||{},x[1]||null)}catch(e){}if(t&&t!==location.pathname)location.replace(location.origin+t+(location.hash||''))})})();</script>`;
  const nf = page({ lang: 'en', key: 'notfound', path: '/404/', title: 'Grupo Soltura', desc: 'Grupo Soltura · Costa Blanca', noindex: true,
    body: `<div class="empty"><h1>Grupo Soltura</h1><p><a class="btn primary" href="/en/">See all homes</a> <a class="btn ghost" href="/en/areas/">Areas</a> · <a href="/nl/">Alle woningen</a> · <a href="/nl/woonplaatsen/">Woonplaatsen</a></p></div>` })
    .replace('</head>', RESOLVE + '\n</head>');
  fs.writeFileSync(path.join(OUT, '404.html'), nf);

  // sitemaps
  const smFile = (name, items) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      items.flatMap(it => Object.entries(it.alt).filter(([, v]) => v).map(([, loc]) => `  <url><loc>${abs(loc)}</loc><lastmod>${it.lastmod}</lastmod>` +
        Object.entries(it.alt).filter(([, v]) => v).map(([l, v]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(v)}"/>`).join('') +
        (it.alt.en ? `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(it.alt.en)}"/>` : '') + `</url>`)).join('\n') + '\n</urlset>\n';
    fs.writeFileSync(path.join(OUT, `sitemap-${name}.xml`), xml);
  };
  for (const [k, v] of Object.entries(sm)) smFile(k, v);
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(sm).map(k => `  <sitemap><loc>${SITE}/sitemap-${k}.xml</loc><lastmod>${TODAY}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>\n`);
  fs.writeFileSync(path.join(OUT, 'routes.json'), JSON.stringify(routes));
  fs.writeFileSync(path.join(OUT, 'build.json'), JSON.stringify({ built_at: new Date().toISOString(), props: props.length, guides: allGuides.length, posts: posts.length, pages: written.length, gone: Object.keys(routes.gone).length }));
  log(`klaar: ${written.length} pagina's, ${Object.keys(routes.gone).length} verdwenen woningen onthouden -> ${path.relative(ROOT, OUT)}/`);
}
main().catch(e => die(e.stack || e.message));
