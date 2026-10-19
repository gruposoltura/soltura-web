/* Grupo Soltura — website POC
   Single-page app: live listings from Supabase (view web_properties), Claude via edge functions.
   No build step; plain JS so it runs on GitHub Pages as-is. */
(() => {
'use strict';

// ---------- config ----------
const SB = 'https://wuvpbwowdycsdlrqkaoq.supabase.co';
const KEY = 'sb_publishable_4FzuR1v2uE0VAAH75XgHIQ_o2qEH6n3';
const FN = SB + '/functions/v1/';
const MEDIA = SB + '/storage/v1/object/public/web-media/';
const VIDEO = { coast: MEDIA + 'hero-coast.mp4', village: MEDIA + 'village-life.mp4', villa: MEDIA + 'villa-terrace.mp4' };
const AGENTS = {
  2: { name: 'Rick', short: 'Rick', tel: '+34664414515', role: { en: 'Partner, Sales', nl: 'Partner, Sales' } },
  3: { name: 'Marco', short: 'Marco', tel: '+34670687341', role: { en: 'Partner, Sales', nl: 'Partner, Sales' } },
  4: { name: 'Ingrid', short: 'Ingrid', tel: '+34664414668', role: { en: '(After) Sales', nl: '(After) Sales' } },
  6: { name: 'Lisette', short: 'Lisette', tel: '+34662226338', role: { en: '(After) Sales', nl: '(After) Sales' } },
};
const OFFICE = 2;
const PAGE = 24;
const CAT_NL = { villa: 'Villa', apartment: 'Appartement', bungalow: 'Bungalow', detached: 'Vrijstaand huis', townhouse: 'Rijtjeshuis', penthouse: 'Penthouse', quadrant: 'Hoekwoning (quad)', duplex: 'Duplex', finca: 'Finca', 'semi-detached': 'Twee-onder-een-kap', commercial: 'Bedrijfspand', other: 'Woning', plot: 'Bouwgrond', attic: 'Penthouse' };
const CAT_EN = { quadrant: 'Quad house', 'semi-detached': 'Semi-detached', attic: 'Penthouse', other: 'Home' };
const LIST_COLS = 'id,wp_id,reference,category,is_newbuild,town,suburb,price,price_from,previous_price,price_changedate,bedrooms,bathrooms,build_area,plot_area,pool_private,pool_communal,dist_sea_m,label_exclusive,label_new,featured,under_offer,list_date,image,photo_count,market_deviation_pct,popularity,agent_wp_id,status,is_own';

// ---------- state ----------
const ls = {
  get(k, d) { try { const v = localStorage.getItem('gs_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gs_' + k, JSON.stringify(v)); } catch {} },
};
// ---------- routes: echte paden per taal (js/routes.js); de taal komt uit het pad ----------
const R = window.ROUTES;
const R0 = R.parse(location.pathname);
const S = {
  lang: (R0 && R0.lang) || ls.get('lang', browserLang()),
  all: [], byRef: new Map(), byId: new Map(), byWp: new Map(), // byId: core-uuid; byWp: oud WP-id (alleen voor bewaarde favorieten van voor 18-10)
  f: blankFilters(), sort: 'foryou', type: 'all',
  shown: PAGE, order: [],
  favs: new Set(ls.get('favs', [])),
  viewed: ls.get('viewed', []), // [property uuid] newest first
  media: new Map(),
  cfg: { itp_resale_pct: 9, iva_newbuild_pct: 10, ajd_newbuild_pct: 1.5, buyer_all_in_eur: 0 },
  // bezoekerscode alleen in de browser bewaren na toestemming; zonder toestemming tellen we anoniem per sessie (in geheugen)
  vid: ls.get('consent', null) === 'yes' && ls.get('consent_v', 0) >= 3 ? (ls.get('vid', null) || rid()) : null, sid: rid(), gaRef: null,
  lastRoute: '/', openSince: 0, openId: null, sheetDepth: 0, pageTitle: '',
};
if (S.vid) ls.set('vid', S.vid); else { try { localStorage.removeItem('gs_vid'); } catch {} }
// browsertaal -> sitetaal (nl, sv, anders en)
function browserLang() { const b = (navigator.language || 'en').toLowerCase(); return b.startsWith('nl') ? 'nl' : b.startsWith('sv') ? 'sv' : 'en'; }
function blankFilters() { return { towns: [], categories: [], price_min: null, price_max: null, beds_min: null, baths_min: null, pool: null, newbuild: null, max_sea_km: null, reduced_only: false, ref_prefix: null }; }
function rid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ---------- Google Analytics 4 (Google-tag van Site Kit, GA4-property 335774479) ----------
// Consent Mode v2: standaard alles 'denied' -> GA4 ontvangt alleen cookieloze pings (geen cookies, geen ID op het apparaat).
// Statistiek-toestemming -> analytics_storage 'granted'. Marketing-toestemming -> ad_* 'granted' en Meta Pixel laden.
// Sinds 19-10-2026 echte paden (/nl/woning/rh550-.../); page_view gaat met het echte pad mee (send_page_view: false, eigen page_view per route).
const GTAG = 'GT-T5MHQ45';
const CONSENT_V = 3; // v2: Google Analytics genoemd; v3 (18-10-2026): aparte keuze marketing (Meta Pixel) -> eerdere keuzes opnieuw vragen
const META_PIXEL = '1362466522519143';
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
const consentCurrent = () => ls.get('consent_v', 0) >= CONSENT_V;
const gaGranted = () => consentCurrent() && ls.get('consent', null) === 'yes';
const adsGranted = () => consentCurrent() && ls.get('consent_ads', false) === true;
const adsState = on => ({ ad_storage: on ? 'granted' : 'denied', ad_user_data: on ? 'granted' : 'denied', ad_personalization: on ? 'granted' : 'denied' });
gtag('consent', 'default', Object.assign({ analytics_storage: gaGranted() ? 'granted' : 'denied', wait_for_update: 500 }, adsState(adsGranted())));
gtag('set', 'url_passthrough', false);
gtag('set', 'ads_data_redaction', true);
gtag('js', new Date());
gtag('config', GTAG, { send_page_view: false, cookie_flags: 'SameSite=Lax;Secure' });
(() => { const g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GTAG; document.head.appendChild(g); })();

// ---------- Meta Pixel: alleen geladen na marketing-toestemming (zonder toestemming geen enkel verzoek naar Meta) ----------
let fbOn = false;
function fbLoad() {
  if (fbOn) return; fbOn = true;
  if (!window.fbq) {
    const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    const f = document.createElement('script'); f.async = true; f.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(f);
  }
  fbq('consent', 'grant');
  fbq('init', META_PIXEL);
}
function fbStop() {
  if (window.fbq) { try { fbq('consent', 'revoke'); } catch {} }
  fbOn = false;
  ['_fbp', '_fbc'].forEach(c => { document.cookie = c + '=; Max-Age=0; path=/'; document.cookie = c + '=; Max-Age=0; path=/; domain=.' + location.hostname.replace(/^www\./, ''); });
}
function fb(ev, prm, custom) { if (!fbOn || !window.fbq) return; try { fbq(custom ? 'trackCustom' : 'track', ev, prm || {}); } catch {} }
if (adsGranted()) fbLoad();
// eigen events -> Meta standaard-events (content_type home_listing = vastgoedcatalogus)
const FB_MAP = { view_property: 'ViewContent', contact_sent: 'Lead', guide_request: 'Lead', newsletter_signup: 'CompleteRegistration', search: 'Search', fav: 'AddToWishlist', whatsapp: 'Contact', call: 'Contact' };
// eigen events -> GA4 (aanbevolen namen waar die bestaan)
const GA_MAP = { view_property: 'view_item', contact_sent: 'generate_lead', guide_request: 'generate_lead', newsletter_signup: 'sign_up', search: 'search', share: 'share', fav: 'add_to_wishlist', whatsapp: 'contact_whatsapp', call: 'contact_call', contact_open: 'contact_open', assistant: 'assistant_question', mortgage: 'mortgage_calc', costs_ask: 'costs_overview', fav_mail: 'favorites_email' };
function gaPath() { return location.pathname || '/'; }
function gaPage(title) {
  fb('PageView');
  try { gtag('event', 'page_view', { page_location: location.origin + gaPath() + location.search, page_path: gaPath(), page_title: title || document.title, language: S.lang, page_referrer: S.gaRef || document.referrer || undefined }); S.gaRef = location.origin + gaPath(); } catch {}
}

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
// L(key, arg) -> pad in de huidige taal; ph(p) -> pad van een woning
const L = (key, arg) => R.href(S.lang, key, arg);
const ph = p => R.href(S.lang, 'property', p);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const t = (k, ...a) => { const v = (I18N[S.lang] || I18N.en)[k] ?? I18N.en[k]; return typeof v === 'function' ? v(...a) : v; };
// taalafhankelijke opmaak: tx({ en, nl, sv }) kiest de tekst in de taal van de pagina (valt terug op Engels)
const tx = o => o[S.lang] ?? o.en;
const LOCALE = { en: 'en-GB', nl: 'nl-NL', sv: 'sv-SE' };
const loc = () => LOCALE[S.lang] || 'en-GB';
const dec = () => S.lang === 'en' ? '.' : ',';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = n => n == null ? '' : new Intl.NumberFormat(loc(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const num = n => new Intl.NumberFormat(loc()).format(n);
const dist = m => m == null || m === 7000 ? null : (m >= 1000 ? (Math.round(m / 100) / 10).toString().replace('.', dec()) + ' km' : Math.round(m) + ' m');
const catName = c => S.lang === 'en' ? (CAT_EN[c] || cap(c)) : R.catName(c, S.lang);
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const title = p => `${catName(p.category)} ${S.lang === 'sv' ? 'i' : 'in'} ${R.placeLabel(p)}`;
const agentOf = p => AGENTS[p.agent_wp_id] || AGENTS[OFFICE];
const reduced = p => p.previous_price && p.previous_price > p.price;
const dropPct = p => reduced(p) ? Math.round((1 - p.price / p.previous_price) * 100) : 0;
const belowMkt = p => !p.is_newbuild && p.market_deviation_pct != null && p.market_deviation_pct <= -8 ? Math.round(-p.market_deviation_pct) : 0;
const ICON = {
  bed: '<svg viewBox="0 0 24 24"><path d="M3 18V7m0 6h18v5M7 13V10h5a3 3 0 0 1 3 3"/></svg>',
  bath: '<svg viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0"/></svg>',
  area: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 9h5V4"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.3 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  l: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  r: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4.3A8 8 0 1 1 8.6 19z"/></svg>',
  pool: '<svg viewBox="0 0 24 24"><path d="M8 15V5a2 2 0 0 1 4 0M14 15V5a2 2 0 0 1 4 0M8 8h6M8 12h6M2 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/></svg>',
  // gemeenschappelijk zwembad: hetzelfde trapje met een "C" ernaast (zoals op de oude site)
  poolC: '<svg viewBox="0 0 24 24"><path d="M4 15V5a2 2 0 0 1 4 0M10 15V5a2 2 0 0 1 4 0M4 8h6M4 12h6M22.2 6.4a3.6 3.6 0 1 0 0 5.2M2 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg>',
  calc: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12v5M8 16h2M12 16h2"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  hand: '<svg viewBox="0 0 24 24"><path d="M9 11V5a1.5 1.5 0 0 1 3 0v5M12 10V4a1.5 1.5 0 0 1 3 0v6M15 10V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L9 13"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
  ig: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  fb: '<svg viewBox="0 0 24 24"><path d="M14 8.5V7c0-.8.5-1.2 1.2-1.2H17V2.5h-2.6C11.6 2.5 10.6 4.4 10.6 7v1.5H8V12h2.6v9.5H14V12h2.7l.4-3.5z" fill="currentColor" stroke="none"/></svg>',
  fs: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7.5h8M8 11h6"/></svg>',
  g: '<svg viewBox="0 0 24 24" class="g-logo"><path fill="#4285F4" stroke="none" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.3-4.8 3.3-8.1z"/><path fill="#34A853" stroke="none" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" stroke="none" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" stroke="none" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
};

async function api(path) {
  const r = await fetch(SB + '/rest/v1/' + path, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error('api ' + r.status);
  return r.json();
}
async function fn(name, body) {
  const r = await fetch(FN + name, { method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, ...j };
}
// UTM-codes bij binnenkomst bewaren (per sessie) en met elk formulier meesturen
const UTM = (() => {
  try {
    const u = {};
    new URLSearchParams(location.search).forEach((v, k) => { if (/^utm_[a-z]+$/i.test(k) && v) u[k.toLowerCase()] = v.slice(0, 120); });
    if (Object.keys(u).length) sessionStorage.setItem('gs_utm', JSON.stringify(u));
    return JSON.parse(sessionStorage.getItem('gs_utm') || 'null');
  } catch { return null; }
})();
// Beschrijvende formulier-ID per ingang; NEXUS toont hier een leesbare naam bij (core.request_forms).
const FORM_NAMES = { viewForm: 'web-property-viewing', guideForm: 'web-property-buying-guide', buyForm: 'web-buy-costs', sellForm: 'web-sell-valuation', moveForm: 'web-move-intake', contactForm: 'web-contact' };
// vaste velden voor web-contact: form_id (beschrijvend), form_el (technisch), page_url, utm, taal, bezoekerscode, woning (uuid + referentie)
function formMeta(formId, p, name) {
  const m = { form_id: name || FORM_NAMES[formId] || formId, form_el: formId, page_url: location.href.slice(0, 300), lang: S.lang, vid: S.vid };
  if (UTM) m.utm = UTM;
  if (p) Object.assign(m, { property_id: p.id, reference: p.reference, wp_id: p.wp_id || null });
  return m;
}
// pid = core-uuid van de woning; wp_id gaat mee zolang de woning er een heeft (oude rapportages)
function track(event, pid = null, value = null, meta = null) {
  try {
    const p = pid ? S.byId.get(pid) : null;
    const wp_id = p && p.wp_id ? p.wp_id : null, property_id = p ? p.id : null;
    gaEvent(event, p, value, meta);
    fetch(SB + '/rest/v1/web_events', {
      method: 'POST', keepalive: true,
      headers: { apikey: KEY, 'content-type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ sid: S.sid, vid: S.vid, lang: S.lang, event, wp_id, property_id, value, meta }),
    });
  } catch {}
}
function gaEvent(event, p, value, meta) {
  try {
    if (event === 'page') return cur().key === 'property' ? undefined : gaPage(); // woning: page_view komt met view_property
    if (event === 'view_property' && p) gaPage(`${title(p)} · ${p.reference} · Grupo Soltura`);
    const fbn = FB_MAP[event];
    if (fbn) {
      const fp = {};
      if (p) Object.assign(fp, { content_ids: [p.reference], content_type: 'home_listing', content_name: title(p), content_category: p.category, currency: 'EUR', value: p.price || undefined, city: p.town });
      if (event === 'search' && meta && meta.q) fp.search_string = String(meta.q).slice(0, 100);
      if (event === 'contact_sent') fp.lead_type = (meta && meta.kind) || 'contact';
      if (event === 'guide_request') fp.lead_type = 'buyer_guide';
      fb(fbn, fp);
    }
    const name = GA_MAP[event]; if (!name) return;
    const prm = { language: S.lang };
    if (p) Object.assign(prm, { item_id: p.reference, item_category: p.category, item_location: p.town, currency: 'EUR', value: p.price || undefined, items: [{ item_id: p.reference, item_name: title(p), item_category: p.category, price: p.price || undefined, location_id: p.town }] });
    if (event === 'search' && meta && meta.q) prm.search_term = String(meta.q).slice(0, 100);
    if (event === 'newsletter_signup') prm.method = 'newsletter';
    if (event === 'guide_request') prm.lead_type = 'buyer_guide';
    if (event === 'contact_sent') prm.lead_type = (meta && meta.kind) || 'contact';
    gtag('event', name, prm);
  } catch {}
}
function sanitize(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,noscript,template').forEach(n => n.remove());
  const ok = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'BR', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4']);
  let slugs = {}; try { slugs = Object.fromEntries((TG.list[S.lang] || []).map(g => [g.slug, 1])); } catch {}
  const walk = n => {
    [...n.children].forEach(c => {
      walk(c);
      if (c.tagName === 'A') { // alleen interne links houden (oude eigen WordPress-links worden omgezet), de rest wordt platte tekst
        const h = c.getAttribute('href') || '', own = /^\/(en|nl|sv)\//.test(h) ? h : R.ownLink(h, S.lang, slugs);
        if (!own) { c.replaceWith(...c.childNodes); return; }
        const cls = c.getAttribute('class');
        [...c.attributes].forEach(a => c.removeAttribute(a.name));
        c.setAttribute('href', own); if (cls === 'town-link') c.className = cls;
        return;
      }
      if (!ok.has(c.tagName)) { c.replaceWith(...c.childNodes); return; }
      [...c.attributes].forEach(a => c.removeAttribute(a.name));
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

// ---------- preference model (what this visitor seems to want) ----------
function prefs() {
  const v = S.viewed.slice(0, 20).map(id => S.byId.get(id)).filter(Boolean);
  const f = [...S.favs].map(id => S.byId.get(id)).filter(Boolean);
  const pool = [...v, ...f, ...f]; // favourites count double
  if (pool.length < 2) return null;
  const tally = key => pool.reduce((m, p) => (m[p[key]] = (m[p[key]] || 0) + 1, m), {});
  const prices = pool.map(p => p.price).filter(Boolean).sort((a, b) => a - b);
  return { towns: tally('town'), cats: tally('category'), median: prices[Math.floor(prices.length / 2)] || null, n: pool.length };
}
function score(p, pr) {
  let s = Math.log10((p.popularity || 0) + 10) * 2;
  if (p.featured) s += 3;
  if (p.list_date) s += Math.max(0, 4 - (Date.now() - new Date(p.list_date)) / 864e5 / 30); // fresh listings
  if (reduced(p)) s += 1.5;
  if (belowMkt(p)) s += 1;
  if (stOf(p) === 'under_offer') s -= 3;
  if (stOf(p) === 'reserved') s -= 5;
  if (stOf(p) === 'sold') s -= 40;
  if (!p.image) s -= 10;
  if (pr) {
    s += 4 * (pr.towns[p.town] || 0) / pr.n + 4 * (pr.cats[p.category] || 0) / pr.n;
    if (pr.median && p.price) s += 3 * Math.max(0, 1 - Math.abs(p.price - pr.median) / pr.median);
  }
  return s;
}

// ---------- filtering ----------
function match(p, f = S.f, type = S.type) {
  if (f.ref_prefix && !String(p.reference || '').toUpperCase().startsWith(f.ref_prefix)) return false;
  if (type === 'resale' && p.is_newbuild) return false;
  if (type === 'new' && !p.is_newbuild) return false;
  if (f.newbuild === true && !p.is_newbuild) return false;
  if (f.newbuild === false && p.is_newbuild) return false;
  if (f.towns.length && !f.towns.includes(p.town)) return false;
  if (f.categories.length && !f.categories.includes(p.category)) return false;
  if (f.price_min && (p.price || 0) < f.price_min) return false;
  if (f.price_max && (p.price || Infinity) > f.price_max) return false;
  if (f.beds_min && (p.bedrooms || 0) < f.beds_min) return false;
  if (f.baths_min && (p.bathrooms || 0) < f.baths_min) return false;
  if (f.pool === 'private' && !p.pool_private) return false;
  if (f.pool === 'communal' && !p.pool_communal) return false;
  if (f.pool === 'any' && !p.pool_private && !p.pool_communal) return false;
  if (f.max_sea_km && p.dist_sea_m != null && p.dist_sea_m !== 7000 && p.dist_sea_m > f.max_sea_km * 1000) return false;
  if (f.reduced_only && !reduced(p)) return false;
  return true;
}
function computeOrder() {
  const pr = prefs();
  let list = S.all.filter(p => match(p));
  const newest = (a, b) => new Date(b.list_date || 0) - new Date(a.list_date || 0);
  const by = {
    // eerste bezoek zonder input (nog geen bekeken woningen/favorieten): eigen woningen vooraan, van recent naar oud;
    // pas zodra de bezoeker iets bekijkt of bewaart, wordt 'voor jou gekozen' gepersonaliseerd
    foryou: pr ? (a, b) => score(b, pr) - score(a, pr) : newest,
    newest,
    price_asc: (a, b) => (a.price || 9e9) - (b.price || 9e9),
    price_desc: (a, b) => (b.price || 0) - (a.price || 0),
    value: (a, b) => (a.is_newbuild || a.market_deviation_pct == null ? 99 : a.market_deviation_pct) - (b.is_newbuild || b.market_deviation_pct == null ? 99 : b.market_deviation_pct),
    reduced: (a, b) => (dropPct(b) - dropPct(a)) || (new Date(b.price_changedate || 0) - new Date(a.price_changedate || 0)),
  }[S.sort] || (() => 0);
  list.sort(by);
  // niet meer beschikbare woningen altijd achteraan (beschikbaar > onder bod > gereserveerd > verkocht)
  const rank = { available: 0, under_offer: 1, reserved: 2, sold: 3 };
  // bij de standaardvolgorde ('voor jou gekozen') staan onze eigen woningen vooraan
  const own = p => (S.sort === 'foryou' && !p.is_own) ? 1 : 0;
  list = list.map((p, i) => [p, i]).sort((a, b) => ((rank[stOf(a[0])] || 0) - (rank[stOf(b[0])] || 0)) || (own(a[0]) - own(b[0])) || a[1] - b[1]).map(x => x[0]);
  S.order = list;
  return list;
}

// ---------- status: Beschikbaar / Onder bod / Gereserveerd / Verkocht ----------
const stOf = p => p.status && p.status !== 'draft' ? p.status : (p.under_offer ? 'under_offer' : 'available');
const isOpen = p => stOf(p) === 'available';
// 'Beschikbaar' tonen we niet; alleen onder bod / gereserveerd / verkocht krijgen een label
const statusTag = (p, big) => isOpen(p) ? '' : `<span class="st st-${stOf(p)}${big ? ' big' : ''}"><i></i>${t('st_' + stOf(p))}</span>`;

// ---------- card ----------
function badges(p) {
  const b = [];
  if (stOf(p) === 'sold') return '';
  if (p.label_new) b.push(`<span class="badge fresh">${t('just_listed')}</span>`); // eerste 7 dagen na publicatie (NEXUS)
  if (reduced(p)) b.push(`<span class="badge drop">${t('reduced')} −${dropPct(p)}%</span>`);
  if (belowMkt(p)) b.push(`<span class="badge value">${t('below_market', belowMkt(p))}</span>`);
  if (p.is_newbuild) b.push(`<span class="badge new">${t('new_badge')}</span>`);
  if (p.label_exclusive) b.push(`<span class="badge">${t('exclusive')}</span>`);
  return b.slice(0, isOpen(p) ? 2 : 1).join('');
}
function priceHtml(p) {
  if (p.price == null) return `<div class="price">${tx({ en: 'Price on request', nl: 'Prijs op aanvraag', sv: 'Pris på förfrågan' })}</div>`;
  return `<div class="price">${p.price_from ? `<small>${t('from')}</small>` : ''}${eur(p.price)}${reduced(p) ? `<s>${eur(p.previous_price)}</s>` : ''}</div>`;
}
function specs(p) {
  const s = [];
  if (p.bedrooms) s.push(`<span title="${t('beds')}">${ICON.bed}${p.bedrooms}</span>`);
  if (p.bathrooms) s.push(`<span title="${t('baths')}">${ICON.bath}${p.bathrooms}</span>`);
  if (p.build_area) s.push(`<span title="${t('built')}">${ICON.area}${num(p.build_area)} m²</span>`);
  if (p.plot_area) s.push(`<span title="${t('plot')}">${num(p.plot_area)} m² ${tx({ en: 'plot', nl: 'perceel', sv: 'tomt' })}</span>`);
  if (p.pool_private) s.push(`<span class="pool own" title="${t('pool_private')}">${ICON.pool}${t('pool_short_private')}</span>`);
  if (p.pool_communal) s.push(`<span class="pool shared" title="${t('pool_communal')}">${ICON.poolC}${t('pool_short_communal')}</span>`);
  return `<div class="specs">${s.join('')}</div>`;
}
function card(p, opts = {}) {
  const fav = S.favs.has(p.id);
  const n = Math.min(p.photo_count || 0, 8);
  return `<a class="card st-card-${stOf(p)}" href="${ph(p)}" data-id="${p.id}">
    <div class="ph">
      ${statusTag(p)}
      ${p.image ? `<img class="kb" src="${esc(p.image)}" alt="${esc(title(p))}" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async">` : ''}
      <div class="badges">${badges(p)}</div>
      ${stOf(p) === 'sold' ? `<span class="sold-band">${t('st_sold')}</span>` : ''}
      <button class="heart" type="button" aria-pressed="${fav}" aria-label="${tx({ en: 'Save', nl: 'Bewaren', sv: 'Spara' })}" data-fav="${p.id}">${ICON.heart}</button>
      ${n > 1 ? `<div class="dots">${'<i></i>'.repeat(n)}</div>` : ''}
      <span class="ref-tag">${esc(p.reference)}</span>
    </div>
    <div class="meta">${priceHtml(p)}<h3>${esc(title(p))}</h3>${specs(p)}</div>
  </a>`;
}

// card interactions: favourite, scrub through photos on hover, in-view motion
document.addEventListener('click', e => {
  const h = e.target.closest('[data-fav]');
  if (!h) return;
  e.preventDefault(); e.stopPropagation();
  toggleFav(h.dataset.fav);
});
function toggleFav(id) {
  if (S.favs.has(id)) S.favs.delete(id); else { S.favs.add(id); track('fav', id); }
  ls.set('favs', [...S.favs]);
  $$(`[data-fav="${id}"]`).forEach(b => b.setAttribute('aria-pressed', S.favs.has(id)));
  favCount();
}
function favCount() { $('#favCount').textContent = S.favs.size; $('.fav-link').classList.toggle('has', S.favs.size > 0); }

// galerij: foto's uit core.property_media (Supabase Storage), volgorde hoofdfoto eerst, dan sort
async function mediaFor(p) {
  if (S.media.has(p.id)) return S.media.get(p.id);
  let urls = [];
  try { const r = await api(`web_properties?select=photos&id=eq.${encodeURIComponent(p.id)}`); urls = (r[0] && r[0].photos) || []; } catch {}
  return setMedia(p, urls);
}
function setMedia(p, urls) {
  urls = (urls || []).filter(Boolean);
  if (!urls.length && p.image) urls = [p.image];
  else if (p.image && !urls.includes(p.image)) urls.unshift(p.image);
  S.media.set(p.id, urls);
  return urls;
}
let scrubTimer = null;
document.addEventListener('pointerover', async e => {
  const c = e.target.closest('.card .ph'); if (!c || e.pointerType !== 'mouse') return;
  const card = c.closest('.card'); if (card.dataset.scrub) return;
  card.dataset.scrub = '1';
  const p = S.byId.get(card.dataset.id); if (!p) return;
  const urls = await mediaFor(p);
  if (urls.length < 2) return;
  urls.slice(0, 8).forEach(u => { const i = new Image(); i.src = u; });
  card.dataset.urls = JSON.stringify(urls.slice(0, 8));
});
document.addEventListener('pointermove', e => {
  const c = e.target.closest('.card .ph'); if (!c) return;
  const card = c.closest('.card'); const urls = card.dataset.urls && JSON.parse(card.dataset.urls); if (!urls) return;
  const r = c.getBoundingClientRect();
  const i = Math.min(urls.length - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * urls.length)));
  const img = $('img', c); if (img && img.dataset.i != i) { img.src = urls[i]; img.dataset.i = i; }
  $$('.dots i', c).forEach((d, k) => d.classList.toggle('on', k === i));
});
const inviewObs = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('inview'); inviewObs.unobserve(en.target); }
}), { threshold: .6 }) : null;
function observeCards(root) { if (inviewObs) $$('.card', root).forEach(c => inviewObs.observe(c)); }

// ---------- video (decoration only; never on listing pages) ----------
function video(src, poster) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const save = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''));
  if (reduce || save) return poster ? `<img class="poster" src="${esc(poster)}" alt="">` : '';
  return `<video autoplay muted loop playsinline preload="metadata" ${poster ? `poster="${esc(poster)}"` : ''} aria-hidden="true"><source src="${src}" type="video/mp4"></video>`;
}

// ---------- typende voorbeeldvragen in het zoekveld ----------
let typeTimer = null;
function typePlaceholder(input, examples) {
  clearTimeout(typeTimer);
  if (!input || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0, ch = 0, del = false;
  const step = () => {
    if (!document.body.contains(input)) return;
    if (document.activeElement === input || input.value) { input.placeholder = t('ask_ph'); typeTimer = setTimeout(step, 1500); return; }
    const ex = examples[i % examples.length];
    ch += del ? -1 : 1;
    input.placeholder = ex.slice(0, ch) + (del ? '' : '▍');
    let wait = del ? 18 : 45;
    if (!del && ch >= ex.length) { del = true; wait = 2200; }
    else if (del && ch <= 0) { del = false; i++; wait = 400; }
    typeTimer = setTimeout(step, wait);
  };
  typeTimer = setTimeout(step, 900);
}

// ---------- socials: band boven de footer + blok op de woningpagina ----------
const SOCIAL = { ig: 'https://www.instagram.com/gruposoltura/', fb: 'https://www.facebook.com/gruposoltura/' };
let socialData = null;
async function loadSocial() {
  if (socialData) return socialData;
  const [feed, stats] = await Promise.all([
    api('web_social_feed?select=*').catch(() => []),
    api('web_social_stats?select=*').then(r => r[0] || {}).catch(() => ({})),
  ]);
  socialData = { feed, stats };
  return socialData;
}
function followBtns(st, compact) {
  return `<div class="follow-btns${compact ? ' compact' : ''}">
    <a class="follow ig" href="${SOCIAL.ig}" target="_blank" rel="noopener" data-social="ig">${ICON.ig}<span><b>Instagram</b>${st.ig_followers ? `<small>${num(st.ig_followers)} ${t('followers')}</small>` : ''}</span></a>
    <a class="follow fb" href="${SOCIAL.fb}" target="_blank" rel="noopener" data-social="fb">${ICON.fb}<span><b>Facebook</b>${st.fb_followers ? `<small>${num(st.fb_followers)} ${t('followers')}</small>` : ''}</span></a>
  </div>`;
}
async function renderSocialBand() {
  const el = $('#socialBand'); if (!el || el.dataset.done) return;
  el.dataset.done = '1';
  const { feed, stats } = await loadSocial();
  const tiles = feed.slice(0, 10).map(f => {
    const href = f.fb_url || (f.on_instagram ? SOCIAL.ig : SOCIAL.fb);
    const media = f.video_url
      ? `<video muted loop playsinline preload="none" ${f.image ? `poster="${esc(f.image)}"` : ''} data-src="${esc(f.video_url)}"></video><span class="tile-play">${ICON.play}</span>`
      : `<img src="${esc(f.image)}" alt="" loading="lazy">`;
    return `<a class="tile" href="${esc(href)}" target="_blank" rel="noopener" data-social="post">${media}<span class="tile-ov"><span class="tile-ic">${f.on_instagram ? ICON.ig : ICON.fb}</span><span class="tile-cap">${esc(f.caption)}</span></span></a>`;
  }).join('');
  el.innerHTML = `<div class="sb-head"><div><h2>${t('social_h')}</h2><p>${t('social_p')}</p></div>${followBtns(stats)}</div>
    ${tiles ? `<div class="sb-strip">${tiles}</div>` : ''}`;
  // reels spelen af zodra ze in beeld zijn (zonder geluid)
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    }), { threshold: .6 });
    $$('video[data-src]', el).forEach(v => io.observe(v));
  }
}
addEventListener('click', e => { const a = e.target.closest('[data-social]'); if (a) track('social', S.openId, null, { k: a.dataset.social }); });
async function renderSocialSheet(p) {
  const box = $('#socialBox'); if (!box) return;
  const { feed, stats } = await loadSocial();
  if (S.openId !== p.id) return;
  const post = feed.find(f => (p.wp_id && f.wp_id === p.wp_id) || (f.reference && f.reference === p.reference));
  const url = location.origin + ph(p);
  box.innerHTML = `<h3>${t('social_sheet_h')}</h3>
    ${post ? `<a class="sp-post" href="${esc(post.fb_url || SOCIAL.ig)}" target="_blank" rel="noopener" data-social="post">${post.image ? `<img src="${esc(post.image)}" alt="" loading="lazy">` : ''}<span><b>${t('social_onpost')}</b><small>${esc(post.caption.slice(0, 90))}…</small></span></a>` : ''}
    <div class="share-row">
      <a class="share fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" data-social="share_fb">${ICON.fb}<span>${t('share_fb')}</span></a>
      <a class="share wa" href="https://wa.me/?text=${encodeURIComponent(title(p) + ' ' + url)}" target="_blank" rel="noopener" data-social="share_wa">${ICON.wa}<span>${t('share_wa')}</span></a>
    </div>
    <p class="sp-follow">${t('social_follow_p')}</p>
    ${followBtns(stats, true)}`;
}

// ---------- Google reviews: laatste drie + score (view web_reviews / web_reviews_summary) ----------
const RV = {
  all: id => `https://search.google.com/local/reviews?placeid=${encodeURIComponent(id || 'ChIJWa-hMmmvYw0R4qKf5TapVp4')}`,
  write: id => `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id || 'ChIJWa-hMmmvYw0R4qKf5TapVp4')}`,
};
let rvData = null;
function loadReviews() {
  if (!rvData) rvData = Promise.all([
    api('web_reviews?select=stars,language,published_at,text,answered&order=published_at.desc&limit=12').catch(() => []),
    api('web_reviews_summary?select=*').then(r => r[0] || null).catch(() => null),
  ]).then(([rows, sum]) => ({ rows, sum }));
  return rvData;
}
const fmtScore = v => String(Number(v).toFixed(1)).replace('.', dec());
function ago(d) {
  const days = Math.round((Date.now() - new Date(d)) / 864e5);
  const rtf = new Intl.RelativeTimeFormat(S.lang, { numeric: 'auto' });
  if (days < 7) return rtf.format(-days, 'day');
  if (days < 45) return rtf.format(-Math.round(days / 7), 'week');
  if (days < 365) return rtf.format(-Math.round(days / 30), 'month');
  return rtf.format(-Math.round(days / 365), 'year');
}
async function fillReviews(el) {
  if (!el || el.dataset.done) return; el.dataset.done = '1';
  const { rows, sum } = await loadReviews();
  if (!rows.length || !sum) { el.hidden = true; return; }
  el.hidden = false;
  const stars = n => `<span class="stars" aria-label="${n}/5">${'★'.repeat(n)}${'<i>★</i>'.repeat(5 - n)}</span>`;
  el.innerHTML = `<div class="rv-wrap">
    <div class="rv-head">
      <div><p class="rv-kicker">${ICON.g}<span>Google reviews</span></p><h2>${t('rv_h')}</h2><p class="lead">${t('rv_p')}</p></div>
      <a class="rv-score" href="${RV.all(sum.place_id)}" target="_blank" rel="noopener" data-social="reviews"><b>${fmtScore(sum.score)}</b><span class="stars big">★★★★★</span><small>${t('rv_count', sum.count)}</small></a>
    </div>
    <div class="rv-grid">${rows.slice(0, 3).map(r => `<figure class="rv">
      <div class="rv-top">${stars(r.stars)}<time datetime="${esc(r.published_at)}">${ago(r.published_at)}</time></div>
      <blockquote>${esc(r.text)}</blockquote>
      <figcaption>${ICON.g}<span>${t('rv_on_google')}${r.answered ? ` · ${t('rv_answered')}` : ''}</span></figcaption></figure>`).join('')}</div>
    <div class="rv-acts"><a class="btn ghost" href="${RV.all(sum.place_id)}" target="_blank" rel="noopener" data-social="reviews">${t('rv_all', sum.count)}</a><a class="btn primary" href="${RV.write(sum.place_id)}" target="_blank" rel="noopener" data-social="review_write">${t('rv_write')}</a></div>
  </div>`;
  $$('.rv blockquote', el).forEach(q => { if (q.scrollHeight > q.clientHeight + 4) { q.classList.add('clamped'); q.addEventListener('click', () => q.classList.toggle('open')); } });
}

// ---------- vaste onderkant op elke pagina: reviews, nieuwsbrief, socials, footer ----------
function renderFooterStack() {
  const rv = $('#reviewsBand'); rv.dataset.done = ''; rv.innerHTML = '';
  const nl = $('#nlBand');
  nl.hidden = !!ls.get('nl_done', 0);
  nl.innerHTML = nl.hidden ? '' : `<div class="nl-band-in">${newsletterHtml('inline')}</div>`;
  bindNewsletters(nl);
  const sb = $('#socialBand'); sb.dataset.done = ''; sb.innerHTML = '';
  // op de woningenpagina staan de reviews al in de feed
  rv.hidden = currentPage === 'home';
  const lazy = (el, fnc) => { if ('IntersectionObserver' in window) { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); fnc(el); } }, { rootMargin: '600px' }); o.observe(el); } else fnc(el); };
  if (!rv.hidden) lazy(rv, fillReviews);
  lazy(sb, renderSocialBand);
}

// ---------- cookiekeuze: statistieken met bezoekerscode alleen na toestemming ----------
function consentBar(force) {
  if (!force && ls.get('consent', null) && consentCurrent()) return;
  let bar = $('#consent');
  if (!bar) { bar = document.createElement('div'); bar.id = 'consent'; bar.className = 'consent'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-modal', 'true'); bar.setAttribute('aria-label', t('cc_h')); document.body.appendChild(bar); }
  let shade = $('#consentShade');
  if (!shade) { shade = document.createElement('div'); shade.id = 'consentShade'; shade.className = 'consent-shade'; document.body.appendChild(shade); }
  const cur = consentCurrent();
  bar.innerHTML = `<h2 class="cc-h">${t('cc_h')}</h2>
    <p>${t('cc_p')} <a href="${L('privacy')}">${t('privacy')}</a></p>
    <div class="cc-opts" hidden>
      <label><input type="checkbox" checked disabled> <span><b>${t('cc_nec')}</b> ${t('cc_nec_d')}</span></label>
      <label><input type="checkbox" id="ccStat" ${cur && gaGranted() ? 'checked' : ''}> <span><b>${t('cc_stat')}</b> ${t('cc_stat_d')}</span></label>
      <label><input type="checkbox" id="ccAds" ${cur && adsGranted() ? 'checked' : ''}> <span><b>${t('cc_ads')}</b> ${t('cc_ads_d')}</span></label>
      <button class="btn ghost cc-save" type="button" data-cc="save">${t('cc_save')}</button>
    </div>
    <div class="cc-btns"><button class="btn ghost" type="button" data-cc="no">${t('cc_no')}</button><button class="btn primary" type="button" data-cc="all">${t('cc_all')}</button></div>
    <button class="cc-more" type="button" aria-expanded="false">${t('cc_set')}</button>`;
  const more = $('.cc-more', bar), opts = $('.cc-opts', bar);
  if (force) { opts.hidden = false; more.hidden = true; }
  more.addEventListener('click', () => { opts.hidden = false; more.hidden = true; more.setAttribute('aria-expanded', 'true'); });
  $$('[data-cc]', bar).forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.cc;
    const stat = k === 'all' || (k === 'save' && $('#ccStat', bar).checked);
    const ads = k === 'all' || (k === 'save' && $('#ccAds', bar).checked);
    ls.set('consent', stat ? 'yes' : 'no'); ls.set('consent_ads', ads); ls.set('consent_v', CONSENT_V);
    gtag('consent', 'update', Object.assign({ analytics_storage: stat ? 'granted' : 'denied' }, adsState(ads)));
    if (stat) { S.vid = ls.get('vid', null) || rid(); ls.set('vid', S.vid); } else { S.vid = null; try { localStorage.removeItem('gs_vid'); } catch {} }
    if (ads) { const was = fbOn; fbLoad(); if (!was) fb('PageView'); } else fbStop();
    track('consent', null, (stat ? 1 : 0) + (ads ? 2 : 0), { stat, ads, how: k, ui: 4 });
    bar.classList.remove('in'); shade.classList.remove('in'); document.documentElement.classList.remove('cc-lock');
    setTimeout(() => { bar.remove(); shade.remove(); }, 300);
  }));
  consentMode();
  if (!force) track('consent_shown', null, null, { ui: 4 });
  requestAnimationFrame(() => { bar.classList.add('in'); shade.classList.add('in'); });
}
// op de privacypagina mag je eerst rustig lezen: banner dan zonder verduistering
function consentMode() {
  const bar = $('#consent'); if (!bar) return;
  const reading = cur().key === 'privacy';
  bar.classList.toggle('docked', reading);
  document.documentElement.classList.toggle('cc-lock', !reading);
  const sh = $('#consentShade'); if (sh) sh.hidden = reading;
}
addEventListener('click', e => { if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); consentBar(true); } });

// ---------- live teller: telt snel op naar het aantal woningen van vandaag ----------
function countUp() {
  const el = $('#liveCount b'); if (!el) return;
  const target = S.all.length; el.dataset.n = target;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = num(target); return; }
  const dur = 1400, t0 = performance.now();
  const tick = now => {
    const k = Math.min(1, (now - t0) / dur);
    el.textContent = num(Math.round(target * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---------- nieuwsbrief: blok in de feed + slide-in bij naar beneden scrollen ----------
const NL_TYPES = ['market_report', 'monthly_matches', 'price_reduced', 'weekly_news'];
function newsletterHtml(variant) {
  const opts = t('nl_opts');
  return `<div class="newsletter ${variant}" data-newsletter>
    ${variant === 'pop' ? `<button class="nl-close" type="button" aria-label="${t('close')}">${ICON.x}</button>` : ''}
    <h2>${t('nl_h1')} <span>${t('nl_h2')}</span></h2>
    <p class="nl-lead">${t('nl_lead')}</p>
    <form class="nl-form" novalidate>
      <div class="nl-opts">${NL_TYPES.map((k, i) => `<label class="nl-opt"><input type="checkbox" name="interests" value="${k}"><span><b>${opts[i][0]}</b><small>${opts[i][1]}</small></span></label>`).join('')}</div>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="nl-fields">
        <label><span>${t('nl_first')}</span><input name="first" autocomplete="given-name"></label>
        <label><span>${t('nl_last')}</span><input name="last" autocomplete="family-name"></label>
        <label class="nl-mail"><span>${t('form_email')} *</span><input name="email" type="email" autocomplete="email" required></label>
        <button class="btn lemon nl-btn" type="submit">${t('nl_btn')}</button>
      </div>
      <p class="nl-note">${t('nl_note')}</p>
      <p class="nl-msg" aria-live="polite"></p>
    </form>
  </div>`;
}
function bindNewsletters(root = document) {
  $$('[data-newsletter]', root).forEach(box => {
    if (box.dataset.bound) return; box.dataset.bound = '1';
    const form = $('.nl-form', box), msg = $('.nl-msg', box);
    const close = $('.nl-close', box);
    if (close) close.onclick = () => { hidePop(); ls.set('nl_dismissed', Date.now()); track('newsletter_dismiss'); };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const interests = fd.getAll('interests');
      const email = (fd.get('email') || '').trim();
      msg.className = 'nl-msg err';
      if (!interests.length) { msg.textContent = t('nl_err_pick'); return; }
      if (!/\S+@\S+\.\S+/.test(email)) { msg.textContent = t('form_err'); return; }
      $('.nl-btn', form).disabled = true;
      const first = (fd.get('first') || '').trim(), last = (fd.get('last') || '').trim();
      const nlv = box.classList.contains('pop') ? 'popup' : box.closest('#feed') ? 'feed' : 'footer';
      const r = await fn('web-contact', { kind: 'newsletter', ...formMeta('nl-form', null, 'web-newsletter-' + nlv), name: `${first} ${last}`.trim(), first, last, first_name: first, last_name: last,
        email, interests, nl_variant: box.classList.contains('pop') ? 'pop' : box.closest('#feed') ? 'feed' : 'inline', website: fd.get('website') }).catch(() => ({ ok: false }));
      $('.nl-btn', form).disabled = false;
      if (r.ok) {
        ls.set('nl_done', Date.now()); track('newsletter_signup', null, interests.length, { interests });
        $$('[data-newsletter]').forEach(b => { $('.nl-form', b).innerHTML = `<p class="nl-msg ok">${t('nl_ok')}</p>`; });
        setTimeout(hidePop, 2500);
      } else msg.textContent = t('form_err');
    });
  });
}
let popShown = false;
function maybePop() {
  if (popShown || !consentCurrent() || ls.get('nl_done', 0) || Date.now() - ls.get('nl_dismissed', 0) < 7 * 864e5) return;
  if (!$('#sheet').hidden || !$('#reel').hidden) return;
  const depth = (scrollY + innerHeight) / document.documentElement.scrollHeight;
  if (currentPage === 'home' && S.rendered >= 18 && depth > .45) {
    popShown = true;
    const pop = document.createElement('div');
    pop.className = 'nl-pop'; pop.id = 'nlPop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', t('nl_h1') + ' ' + t('nl_h2'));
    pop.innerHTML = newsletterHtml('pop');
    document.body.appendChild(pop);
    requestAnimationFrame(() => pop.classList.add('in'));
    bindNewsletters(pop);
    track('newsletter_pop');
  }
}
function hidePop() { const p = $('#nlPop'); if (p) { p.classList.remove('in'); setTimeout(() => p.remove(), 400); } }
addEventListener('scroll', () => { if (!popShown) maybePop(); }, { passive: true });

// ---------- HOME ----------
function renderHome() {
  const main = $('#main');
  const n = S.all.length;
  const heroPoster = (S.all.find(p => p.featured && p.image) || {}).image;
  main.innerHTML = `
  <section class="hero">
    ${video(VIDEO.coast, heroPoster)}
    <a class="live-count" href="#bar" id="liveCount"><b data-n="${n}">${n ? 0 : '…'}</b> ${t('live')}</a>
    <div class="hero-body">
      <h1>${t('hero_title')}</h1>
      <p class="sub">${t('hero_sub')}</p>
      <div class="hero-badges"><div class="ai-badge"><i></i>${ICON.spark}<span>${t('ai_badge')}</span></div><a class="rv-pill" id="rvPill" hidden target="_blank" rel="noopener" data-social="reviews_hero"></a></div>
      <form class="ask" id="askForm" role="search">
        <input id="askInput" type="search" autocomplete="off" placeholder="${esc(t('ask_ph'))}" aria-label="${esc(t('ask_ph'))}">
        <button type="submit" id="askBtn">${t('ask_btn')}</button>
      </form>
      <div class="chips">${t('chips').map(c => `<button type="button" class="chip">${esc(c)}</button>`).join('')}</div>
      <div class="ai-bubble" id="aiReply" aria-live="polite" hidden></div>
    </div>
  </section>
  <div class="bar" id="bar"></div>
  <div class="hints" id="hints">
    <button type="button" data-hint="search">${ICON.spark}<span>${t('hint_search')}</span></button>
    <button type="button" data-hint="hover">${ICON.hand}<span>${t(matchMedia('(hover: hover)').matches ? 'hint_hover' : 'hint_tap')}</span></button>
    <button type="button" data-hint="ask">${ICON.chat}<span>${t('hint_ask')}</span></button>
    <button type="button" data-hint="reel">${ICON.play}<span>${t('hint_reel')}</span></button>
    <button type="button" data-hint="fav">${ICON.heart}<span>${t('hint_fav')}</span></button>
  </div>
  <section class="feed" id="feed" aria-live="polite"></section>
  <div class="loadmore"><button class="btn ghost" id="moreBtn" type="button">${t('more')}</button></div>
  <div id="sentinel"></div>`;
  typePlaceholder($('#askInput'), t('ask_examples'));
  $('#liveCount').addEventListener('click', e => { e.preventDefault(); $('#bar').scrollIntoView({ behavior: 'smooth' }); });
  if (n) countUp();
  loadReviews().then(({ sum }) => { const a = $('#rvPill'); if (a && sum) { a.href = RV.all(sum.place_id); a.innerHTML = `${ICON.g}<b>${fmtScore(sum.score)}</b><span class="stars">★★★★★</span><small>${t('rv_count', sum.count)}</small>`; a.hidden = false; } });
  $('#askForm').addEventListener('submit', e => { e.preventDefault(); aiSearch($('#askInput').value); });
  $$('.chip').forEach(c => c.addEventListener('click', () => { $('#askInput').value = c.textContent; aiSearch(c.textContent); }));
  $$('#hints [data-hint]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.hint; track('hint', null, null, { k });
    if (k === 'search') { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => $('#askInput').focus(), 350); }
    else if (k === 'reel') openReel(0);
    else if (k === 'fav') go(L('favorites'));
    else { const c = $('#feed .card'); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.classList.add('coach'); setTimeout(() => c.classList.remove('coach'), 2600); if (k === 'ask') setTimeout(() => c.click(), 900); } }
  }));
  $('#moreBtn').addEventListener('click', () => { S.shown += PAGE; renderFeed(true); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => {
    if (es[0].isIntersecting && S.shown < S.order.length && S.all.length) { S.shown += PAGE; renderFeed(true); }
  }, { rootMargin: '800px' }).observe($('#sentinel'));
  renderBar(); renderFeed();
  track('view_feed');
}

function renderBar() {
  const bar = $('#bar'); if (!bar) return;
  const f = S.f, pills = [];
  const pill = (txt, key) => pills.push(`<span class="filter-pill">${esc(txt)}<button type="button" data-clear="${key}" aria-label="${t('clear')}">×</button></span>`);
  if (f.ref_prefix) pill(`${t('ref_short')} ${f.ref_prefix}…`, 'ref_prefix');
  if (f.towns.length) pill(f.towns.join(', '), 'towns');
  if (f.categories.length) pill(f.categories.map(catName).join(', '), 'categories');
  if (f.price_min || f.price_max) pill(`${f.price_min ? eur(f.price_min) : '€0'} – ${f.price_max ? eur(f.price_max) : '…'}`, 'price');
  if (f.beds_min) pill(`${f.beds_min}+ ${t('beds')}`, 'beds_min');
  if (f.baths_min) pill(`${f.baths_min}+ ${t('baths')}`, 'baths_min');
  if (f.pool) pill(f.pool === 'communal' ? t('pool_communal') : t('pool_private'), 'pool');
  if (f.max_sea_km) pill(`≤ ${f.max_sea_km} km ${tx({ en: 'to the sea', nl: 'tot zee', sv: 'till havet' })}`, 'max_sea_km');
  if (f.reduced_only) pill(t('reduced'), 'reduced_only');
  if (f.newbuild != null) pill(f.newbuild ? t('newbuild') : t('resale'), 'newbuild');
  const sorts = ['foryou', 'newest', 'price_asc', 'price_desc', 'value', 'reduced'];
  bar.innerHTML = `
    <div class="seg" role="group">${['all', 'resale', 'new'].map(k => `<button type="button" data-type="${k}" aria-pressed="${S.type === k}">${t(k === 'new' ? 'newbuild' : k)}</button>`).join('')}</div>
    <select id="sortSel" aria-label="Sort">${sorts.map(s => `<option value="${s}" ${S.sort === s ? 'selected' : ''}>${t('sort_' + s)}</option>`).join('')}</select>
    ${pills.join('')}
    ${pills.length ? `<button class="btn ghost" style="padding:6px 12px;font-size:14px" type="button" data-clear="all">${t('clear')}</button>` : ''}
    <span class="spacer"></span>
    <span class="result-n" id="resultN"></span>
    <button class="btn-reel" type="button" id="reelBtn" aria-label="${t('browse_full')}">${ICON.play}<span>${t('browse_full')}</span></button>`;
  $$('[data-type]', bar).forEach(b => b.addEventListener('click', () => { S.type = b.dataset.type; S.shown = PAGE; renderBar(); renderFeed(); track('filter', null, null, { type: S.type }); }));
  $('#sortSel').addEventListener('change', e => { S.sort = e.target.value; S.shown = PAGE; renderFeed(); track('filter', null, null, { sort: S.sort }); });
  $$('[data-clear]', bar).forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.clear;
    if (k === 'all') S.f = blankFilters();
    else if (k === 'price') { S.f.price_min = S.f.price_max = null; }
    else if (k === 'towns' || k === 'categories') S.f[k] = [];
    else if (k === 'reduced_only') S.f.reduced_only = false;
    else S.f[k] = null;
    S.shown = PAGE; renderBar(); renderFeed();
  }));
  $('#reelBtn').addEventListener('click', () => openReel(0));
}

function renderFeed(append = false) {
  setTimeout(() => $$('[data-reviews]:not([data-done])').forEach(fillReviews), 0);
  const feed = $('#feed'); if (!feed) return;
  if (!S.all.length) { feed.innerHTML = Array.from({ length: 6 }, () => '<div><div class="ph skeleton" style="aspect-ratio:4/3;border-radius:14px"></div></div>').join(''); return; }
  const list = append ? S.order : computeOrder();
  $('#resultN').textContent = t('results', list.length);
  if (!list.length) {
    // filters via de balk: geen lege pagina maar een ballon met concrete aanpassingen
    S.sugg = relaxations();
    feed.innerHTML = `<div class="ai-bubble in warn feed-bubble" style="grid-column:1/-1"><span class="ab-av">S</span><div class="ab-body">
      <div class="ab-none"><b>${t('none_h')}</b> ${t('none_bar')}</div>
      ${S.sugg.length ? `<div class="ab-sugg">${S.sugg.map((x, i) => `<button type="button" data-sug="${i}">${esc(x.label)} <small>${x.n}</small></button>`).join('')}</div>` : ''}
      <p class="ab-tip">${t('none_contact')} <a href="${L('contact')}">${t('nav_contact')}</a></p></div></div>`;
    bindSugg(feed);
    $('#moreBtn').hidden = true; return;
  }
  const start = append ? S.rendered : 0;
  const slice = list.slice(start, S.shown);
  S.rendered = start + slice.length;
  let html = '';
  slice.forEach((p, i) => {
    const pos = start + i;
    html += card(p, { eager: pos < 3 });
    html += moment(pos + 1);
  });
  if (append) { feed.insertAdjacentHTML('beforeend', html); } else { feed.innerHTML = html; }
  bindNewsletters(feed);
  $('#moreBtn').hidden = S.shown >= list.length;
  observeCards(feed);
}

// moments keep people browsing: rails and a single video story between the cards
function moment(pos) {
  const pr = prefs();
  const shownIds = new Set(S.order.slice(0, S.shown).map(p => p.id));
  const pick = (fnSort, filt, n = 10) => S.all.filter(p => p.image && isOpen(p) && filt(p) && match(p, blankFilters())).sort(fnSort).slice(0, n);
  const rail = (h, p, items) => items.length < 3 ? '' : `<div class="moment"><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}<div class="rail">${items.map(x => card(x)).join('')}</div></div>`;
  if (pos === 6) {
    if (pr) return rail(t('m_foryou_h'), t('m_foryou_p'), pick((a, b) => score(b, pr) - score(a, pr), p => !S.viewed.includes(p.id) && !shownIds.has(p.id)));
    return rail(t('m_drops_h'), t('m_drops_p'), pick((a, b) => new Date(b.price_changedate || 0) - new Date(a.price_changedate || 0), reduced));
  }
  if (pos === 15) return `<div class="story">${video(VIDEO.village)}<div><h2>${t('story_move_h')}</h2><p>${t('story_move_p')}</p><a class="btn lemon" href="${L('move')}">${t('story_move_btn')}</a></div></div>`;
  if (pos === 24) return rail(t('m_value_h'), t('m_value_p'), pick((a, b) => a.market_deviation_pct - b.market_deviation_pct, p => belowMkt(p) > 0));
  if (pos === 30) return `<div class="moment rv-moment" data-reviews></div>`;
  if (pos === 36 && S.viewed.length >= 3) return rail(t('m_recent_h'), '', S.viewed.slice(0, 12).map(id => S.byId.get(id)).filter(Boolean));
  // nieuwsbrief-aanmelding tussen de woningen (zelfde blok als de pop-up), zolang iemand nog niet is aangemeld
  if ((pos === 40 || pos === 72) && !ls.get('nl_done', 0)) return `<div class="moment nl-moment">${newsletterHtml('inline')}</div>`;
  if (pos === 48) return `<div class="story">${video(VIDEO.villa)}<div><h2>${t('story_sell_h')}</h2><p>${t('story_sell_p')}</p><a class="btn lemon" href="${L('sell')}">${t('story_sell_btn')}</a></div></div>`;
  return '';
}

// begin van een referentienummer, alleen als de vraag dat duidelijk maakt:
// "referentie RH", "ref begint met VWX", "alle huizen die beginnen met RH", "RH*". Losse letters zonder zo'n aanwijzing gaan gewoon naar de assistent.
function findRefPrefix(q) {
  const qs = q.trim();
  const known = pre => S.all.some(p => String(p.reference || '').toUpperCase().startsWith(pre));
  const pats = [
    /^([A-Za-z]{1,6}\d{0,4})\s*[*…]$/,                                                        // RH*  of  RH…
    /\b(?:referen\w*|ref\.?|refnr\.?|referencia|código)\s*(?:nummers?|numbers?|nrs?\.?)?\s*(?:die|dat|that|which|que)?\s*(?:begin\w*|start\w*|empie\w*)?\s*(?:met|with|con|por)?\s*["'“‘]?([A-Za-z]{1,6}\d{0,4})["'”’]?\s*[*…]?\s*$/i,
    /\b(?:begin\w*|start\w*|empie\w*)\s+(?:met|with|con|por)\s+(?:de\s+letters?\s+|the\s+letters?\s+|las\s+letras\s+)?["'“‘]?([A-Za-z]{1,6}\d{0,4})["'”’]?\s*[*…]?\s*$/i,
  ];
  for (let i = 0; i < pats.length; i++) {
    const m = qs.match(pats[i]); if (!m) continue;
    const pre = m[1].toUpperCase();
    if (known(pre)) return pre;
    if (i < 2) return { none: pre }; // alleen bij expliciet 'referentie' of 'RH*' melden dat het niet bestaat
  }
  return null;
}
// referentienummer herkennen (RH500, rh 500, VWX-541, of alleen de cijfers als die uniek zijn): direct de woning openen
function findRef(q) {
  const up = q.toUpperCase();
  const toks = up.match(/[A-Z]{1,6}[\s.\-]?\d{2,6}/g) || [];
  for (const tk of toks) { const k = tk.replace(/[\s.\-]/g, ''); if (S.byRef.has(k)) return { p: S.byRef.get(k) }; }
  const digits = up.replace(/^(REF\.?|REFERENTIE|REFERENCE)\s*/, '').trim();
  if (/^\d{3,6}$/.test(digits)) {
    const hits = S.all.filter(p => String(p.reference).toUpperCase().replace(/^[A-Z]+/, '') === digits);
    if (hits.length === 1) return { p: hits[0] };
    if (hits.length > 1) return { many: hits };
  }
  // lijkt op een referentie (één woord, letters+cijfers) maar staat niet online
  const bare = up.replace(/^(REF\.?|REFERENTIE|REFERENCE)\s*/, '').trim();
  if (/^[A-Z]{2,4}[.\-]?\d{3,5}$/.test(bare)) return { missing: bare.replace(/[.\-]/g, '') };
  return null;
}
async function aiSearch(q) {
  q = (q || '').trim(); if (!q) return;
  const btn = $('#askBtn'), out = $('#aiReply');
  const pre = S.all.length ? findRefPrefix(q) : null;
  if (pre) {
    out.hidden = false;
    if (typeof pre === 'string') {
      S.f = Object.assign(blankFilters(), { ref_prefix: pre }); S.type = 'all'; S.shown = PAGE;
      const n = S.all.filter(p => match(p)).length;
      out.className = 'ai-bubble in';
      out.innerHTML = `<span class="ab-av">S</span><div class="ab-body"><p class="ab-reply">${t('ref_prefix_ok', n, esc(pre))}</p></div>`;
      track('search_ref_prefix', null, n, { pre });
      renderBar(); renderFeed();
      setTimeout(() => $('#bar').scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
    } else {
      out.className = 'ai-bubble in warn';
      out.innerHTML = `<span class="ab-av">S</span><div class="ab-body"><div class="ab-none"><b>${t('ref_prefix_none', esc(pre.none))}</b> ${t('ref_prefix_tip')}</div></div>`;
    }
    return;
  }
  const ref = S.all.length ? findRef(q) : null;
  if (ref) {
    out.hidden = false; out.className = 'ai-bubble in' + (ref.p ? '' : ' warn');
    if (ref.p) {
      out.innerHTML = `<span class="ab-av">S</span><div class="ab-body"><p class="ab-reply">${t('ref_open', esc(ref.p.reference))}</p></div>`;
      track('search_ref', null, null, { ref: ref.p.reference });
      go(ph(ref.p));
    } else if (ref.many) {
      S.sugg = ref.many.map(p => ({ ref: p.reference }));
      out.innerHTML = `<span class="ab-av">S</span><div class="ab-body"><p class="ab-reply">${t('ref_many')}</p><div class="ab-sugg">${ref.many.slice(0, 8).map(p => `<a class="ab-ref" href="${ph(p)}">${esc(p.reference)} <small>${esc(p.town || '')}</small></a>`).join('')}</div></div>`;
    } else {
      out.innerHTML = `<span class="ab-av">S</span><div class="ab-body"><div class="ab-none"><b>${t('ref_missing_h', esc(ref.missing))}</b> ${t('ref_missing_p')}</div><p class="ab-tip"><a href="https://wa.me/34664414515?text=${encodeURIComponent(t('wa_text', ref.missing))}" target="_blank" rel="noopener">WhatsApp</a> · <a href="${L('contact')}">${t('nav_contact')}</a></p></div>`;
      track('search_ref_missing', null, null, { ref: ref.missing });
    }
    return;
  }
  btn.disabled = true; btn.textContent = t('asking');
  out.hidden = false; out.className = 'ai-bubble'; out.innerHTML = `<span class="ab-av">S</span><div class="ab-body"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  track('search', null, null, { q: q.slice(0, 200) });
  const r = await fn('web-assistant', { mode: 'search', lang: S.lang, query: q }).catch(() => ({}));
  btn.disabled = false; btn.textContent = t('ask_btn');
  if (r.filters) {
    const f = Object.assign(blankFilters(), r.filters);
    f.towns = Array.isArray(f.towns) ? f.towns : []; f.categories = Array.isArray(f.categories) ? f.categories : [];
    S.f = f;
    if (r.filters.sort && ['newest', 'price_asc', 'price_desc', 'value'].includes(r.filters.sort)) S.sort = r.filters.sort;
    if (r.filters.reduced_only) S.sort = 'reduced';
    S.type = 'all'; S.shown = PAGE;
  }
  // nooit een lege pagina: zonder treffers versoepelen we zelf en stellen we concrete aanpassingen voor
  let note = '';
  if (r.filters && !S.all.some(p => match(p))) {
    const sug = relaxations();
    if (sug.length) {
      S.f = sug[0].f; S.type = sug[0].type; S.shown = PAGE;
      note = `<div class="ab-none"><b>${t('none_h')}</b> ${t('none_applied', sug[0].label, sug[0].n)}</div>
        ${sug.length > 1 ? `<p class="ab-try">${t('none_try')}</p><div class="ab-sugg">${sug.slice(1).map((x, i) => `<button type="button" data-sug="${i + 1}">${esc(x.label)} <small>${x.n}</small></button>`).join('')}</div>` : ''}
        <p class="ab-tip">${t('none_tip')}</p>`;
      S.sugg = sug;
      track('search_relaxed', null, sug[0].n, { q: q.slice(0, 120) });
    }
  }
  if (!r.filters && !r.reply) note = `<div class="ab-none"><b>${t('ai_fail_h')}</b> ${t('ai_fail_p')}</div><p class="ab-tip">${t('none_tip')}</p>`;
  // Lokale vraag (weekmarkt, strand, vliegveld...): filters blijven staan, geen scroll; wel een knop naar onze woningen in die plaats.
  let cta = '';
  if (!r.filters && r.town && r.cta) {
    const f = Object.assign(blankFilters(), { towns: [r.town] });
    const n = S.all.filter(p => match(p, f, 'all')).length;
    if (n) { S.sugg = [{ f, type: 'all', n }]; cta = `<div class="ab-sugg"><button type="button" data-sug="0">${esc(r.cta)} <small>${n}</small></button></div>`; }
    track('search_local', null, n, { q: q.slice(0, 120), town: r.town });
  } else if (!r.filters && r.reply) track(r.intent === 'off_topic' ? 'search_offtopic' : 'search_local', null, null, { q: q.slice(0, 120) });
  out.className = 'ai-bubble in' + (note ? ' warn' : '');
  out.innerHTML = `<span class="ab-av">S</span><div class="ab-body">${r.reply ? `<p class="ab-reply">${esc(r.reply)}</p>` : ''}${cta}${note}</div>`;
  bindSugg(out);
  renderBar(); renderFeed();
  if (!note && r.filters) setTimeout(() => $('#bar').scrollIntoView({ behavior: 'smooth', block: 'start' }), 1600);
}
// alternatieven bij nul treffers: telkens één wens versoepelen en tellen wat er dan wél is
function relaxations() {
  const base = S.f, type = S.type;
  const cnt = (f, ty = type) => S.all.filter(p => match(p, f, ty)).length;
  const out = [];
  const add = (label, f, ty = type) => { const n = cnt(f, ty); if (n > 0) out.push({ label, f, type: ty, n }); };
  const w = o => Object.assign({}, base, o);
  if (base.price_max) {
    const prices = S.all.filter(p => match(p, w({ price_max: null }))).map(p => p.price).filter(Boolean).sort((a, b) => a - b);
    if (prices.length) { const v = Math.ceil(prices[Math.min(4, prices.length - 1)] / 5000) * 5000; add(t('rx_budget', eur(v)), w({ price_max: v })); }
  }
  if (base.price_min) add(t('rx_pmin'), w({ price_min: null }));
  if (base.towns.length) add(t('rx_towns', base.towns.join(', ')), w({ towns: [] }));
  if (base.categories.length) add(t('rx_cat', base.categories.map(catName).join(', ')), w({ categories: [] }));
  if (base.beds_min > 1) add(t('rx_beds', base.beds_min - 1), w({ beds_min: base.beds_min - 1 }));
  if (base.baths_min) add(t('rx_baths'), w({ baths_min: null }));
  if (base.pool === 'private') add(t('rx_pool_any'), w({ pool: 'any' }));
  else if (base.pool) add(t('rx_pool'), w({ pool: null }));
  if (base.newbuild != null) add(t('rx_newbuild'), w({ newbuild: null }));
  if (type !== 'all') add(t('rx_newbuild'), base, 'all');
  if (base.max_sea_km) add(t('rx_sea', base.max_sea_km * 2), w({ max_sea_km: base.max_sea_km * 2 }));
  if (base.reduced_only) add(t('rx_reduced'), w({ reduced_only: false }));
  // budget eerst als dat het probleem is (meest gevraagd), daarna wat het meeste oplevert
  return out.sort((a, b) => (b.f.price_max !== base.price_max && b.f.price_max ? 1 : 0) - (a.f.price_max !== base.price_max && a.f.price_max ? 1 : 0) || b.n - a.n).slice(0, 4);
}
function bindSugg(root) {
  $$('[data-sug]', root).forEach(b => b.addEventListener('click', () => {
    const x = S.sugg[+b.dataset.sug]; if (!x) return;
    S.f = x.f; S.type = x.type; S.shown = PAGE; track('search_suggestion', null, x.n);
    $$('[data-sug]', root).forEach(o => o.classList.toggle('on', o === b));
    renderBar(); renderFeed(); $('#bar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

// ---------- PROPERTY SHEET ----------
async function openSheet(ref) {
  const p = S.byRef.get(ref.toUpperCase());
  const sh = $('#sheet'), inner = $('#sheetInner');
  if (!p) { inner.innerHTML = `<div class="empty"><h2>${tx({ en: 'This home is no longer available', nl: 'Deze woning is niet meer beschikbaar', sv: 'Den här bostaden är inte längre till salu' })}</h2><p><a class="btn primary" href="${L('home')}">${t('see_all')}</a></p></div>`; sh.hidden = false; return; }
  closeSheetTracking();
  S.openId = p.id; S.openSince = Date.now();
  document.title = `${title(p)} · ${p.reference} · Grupo Soltura`;
  S.viewed = [p.id, ...S.viewed.filter(x => x !== p.id)].slice(0, 60); ls.set('viewed', S.viewed);
  track('view_property', p.id);
  document.body.style.overflow = 'hidden';
  sh.hidden = false;
  const ag = agentOf(p);
  const waHref = `https://wa.me/${ag.tel.replace('+', '')}?text=${encodeURIComponent(t('wa_text', p.reference))}`;
  inner.innerHTML = `
    <div class="sh-top">
      <button class="icon-btn" type="button" data-close aria-label="${t('close')}">${ICON.x}</button>
      <span class="ref">${t('sh_ref')} ${esc(p.reference)}</span><span class="grow"></span>
      <button class="icon-btn" type="button" id="shShare" aria-label="${t('share')}">${ICON.share}</button>
      <button class="heart" style="position:static;border:1px solid var(--mist)" type="button" aria-pressed="${S.favs.has(p.id)}" data-fav="${p.id}" aria-label="Save">${ICON.heart}</button>
      <button class="icon-btn" type="button" data-step="-1" aria-label="${t('prev_home')}">${ICON.l}</button>
      <button class="icon-btn" type="button" data-step="1" aria-label="${t('next_home')}">${ICON.r}</button>
    </div>
    <div class="gal" id="gal"><div class="gal-track" id="galTrack">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}</div>
      <button class="nav-g prev" type="button" aria-label="Previous photo">${ICON.l}</button><button class="nav-g next" type="button" aria-label="Next photo">${ICON.r}</button><span class="count" id="galCount"></span><button class="gal-fs" type="button" id="galFs" aria-label="${t('fullscreen')}">${ICON.fs}<span>${t('fullscreen')}</span></button><span class="ref-tag gal-ref">${esc(p.reference)}</span>${statusTag(p)}</div>
    <div class="thumbs" id="thumbs"></div>
    <div class="sh-body">
      <div>
        <div class="badges" style="display:flex;gap:6px">${badges(p)}</div>
        ${isOpen(p) ? '' : `<div class="sh-status">${statusTag(p, true)}</div>`}
        <h1 id="sheetTitle">${esc(title(p))}</h1>
        ${isOpen(p) ? '' : `<div class="st-note st-note-${stOf(p)}">${t('st_note_' + stOf(p))} <a href="#shMore" data-scroll>${t('st_similar')}</a></div>`}
        <div class="sh-price">${p.price_from ? `<small style="font-size:16px;font-weight:500">${t('from')}</small>` : ''}${p.price != null ? eur(p.price) : ''}${reduced(p) ? `<s>${eur(p.previous_price)}</s>` : ''}</div>
        <div class="quick-acts">
          <button type="button" data-go="chatBox">${ICON.chat}<span>${t('qa_ask')}</span></button>
          <button type="button" data-go="mortBox">${ICON.calc}<span>${t('qa_mort')}</span></button>
          <button type="button" data-go="gal">${ICON.cam}<span id="qaPhotos">${t('qa_photos', p.photo_count || 1)}</span></button>
          <button type="button" data-go="viewBtn">${ICON.cal}<span>${t('qa_view')}</span></button>
          <button type="button" data-go="guideBox">${ICON.book}<span>${t('qa_guide')}</span></button>
        </div>
        <div class="keyfacts" id="keyfacts"></div>
        <div id="marketBox"></div>
        <div class="desc" id="desc"><p class="skeleton" style="height:8em;border-radius:8px"></p></div>
        <div id="featBox"></div>
        ${mortgageHtml(p)}
      </div>
      <aside class="side">
        <div class="box chat" id="chatBox">
          <div class="chat-head"><div class="chat-av">S<i class="online"></i></div><div><h3>${t('ask_h')}</h3><p>${t('ask_sub')}</p></div></div>
          <div class="log" id="chatLog"><div class="msg a intro typing-dots"><span></span><span></span><span></span></div></div>
          <div class="sugg" id="chatSugg">${t('ask_start').map(s => `<button type="button">${esc(s)}</button>`).join('')}</div>
          <form id="chatForm"><input id="chatIn" autocomplete="off" placeholder="${esc(t('ask_ph2'))}" aria-label="${esc(t('ask_ph2'))}"><button type="submit">${t('send')}</button></form>
          <p class="chat-hint">${t('ask_hint')}</p>
        </div>
        <div class="box">
          <div class="agent"><div class="av">${ag.short[0]}</div><div><b>${esc(ag.name)}</b><span>${t('agent_role')}</span></div></div>
          <a class="rv-mini" id="rvMini" hidden target="_blank" rel="noopener" data-social="reviews_sheet"></a>
          <a class="btn wa" href="${waHref}" target="_blank" rel="noopener" data-track="whatsapp">${t('wa_btn')}</a>
          <a class="btn ghost" href="tel:${ag.tel}" data-track="call">${t('call_btn')} ${ag.tel.replace(/(\+34)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}</a>
          <button class="btn primary" type="button" id="viewBtn">${t('viewing_btn')}</button>
          <form class="form" id="viewForm" hidden style="margin-top:12px">${contactFields('viewing', p)}</form>
        </div>
        ${guideHtml(p)}
        <div id="costBox"></div>
        <div class="box social-box" id="socialBox"></div>
      </aside>
    </div>
    <button class="chat-fab" type="button" id="chatFab">${t('ask_fab')}</button>
    <div class="sh-area" id="shArea"></div>
    <div class="sh-more" id="shMore"></div>
    <div class="sh-next"><button class="btn ghost" type="button" data-step="-1">← ${t('prev_home')}</button><button class="btn primary" type="button" data-step="1">${t('next_home')} →</button></div>`;
  inner.scrollTop = 0;
  bindSheet(p, waHref);
  loadReviews().then(({ rows, sum }) => { const a = $('#rvMini'); if (!a || !sum || S.openId !== p.id) return; const q = rows.find(r => r.text.length < 160) || rows[0]; a.href = RV.all(sum.place_id); a.innerHTML = `<span class="rv-mini-top">${ICON.g}<b>${fmtScore(sum.score)}</b><span class="stars">★★★★★</span><small>${t('rv_count', sum.count)}</small></span>${q ? `<q>${esc(q.text.length > 150 ? q.text.slice(0, 147) + '…' : q.text)}</q>` : ''}`; a.hidden = false; });
  fillFacts(p);
  renderMore(p);
  // details + gallery in parallel
  const [full, geo] = await Promise.all([
    api(`web_properties?select=*&id=eq.${encodeURIComponent(p.id)}`).then(r => r[0]).catch(() => null),
    api(`web_property_geo?select=*&id=eq.${encodeURIComponent(p.id)}`).then(r => r[0]).catch(() => null),
  ]);
  if (S.openId !== p.id) return;
  const urls = full ? setMedia(p, full.photos) : await mediaFor(p);
  if (S.openId !== p.id) return;
  gallery(urls);
  if ($('#qaPhotos')) $('#qaPhotos').textContent = t('qa_photos', urls.length);
  if (geo && geo.beach_km != null) {
    const km = v => String(Math.round(v)).replace('.', ',') + ' km';
    $('#keyfacts').insertAdjacentHTML('afterbegin', `<div><b>${km(geo.beach_road_km || geo.beach_km)}</b><span>${t('sh_sea')} · ${geo.beach_drive_min} min</span></div><div><b>${km(geo.alc_km * 1.25)}</b><span>${t('sh_airport')} ALC · ${geo.alc_drive_min} min</span></div>`);
  }
  if (full) fillDetail(full);
}
// ---------- koopgids aanvragen (aanhef, voornaam, achternaam, e-mail) ----------
function guideHtml(p) {
  return `<div class="box guide-box" id="guideBox">
    <div class="gb-head"><span class="gb-ic">${ICON.book}</span><div><h3>${t('guide_h')}</h3><p>${t('guide_p')}</p></div></div>
    <ul class="gb-list">${t('guide_items').map(x => `<li>${x}</li>`).join('')}</ul>
    <button class="btn lemon" type="button" id="guideBtn">${t('guide_btn')}</button>
    <form class="form rich gb-form" id="guideForm" hidden novalidate>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="row2"><label><span>${t('nl_first')} *</span><input name="first" autocomplete="given-name" required></label><label><span>${t('nl_last')} *</span><input name="last" autocomplete="family-name" required></label></div>
      <label><span>${t('form_email')} *</span><input name="email" type="email" autocomplete="email" required></label>
      <button class="btn primary" type="submit">${t('guide_send')}</button>
      <p class="ok" aria-live="polite"></p>
      <p class="form-note">${t('form_privacy')} <a href="${L('privacy')}">${t('privacy')}</a></p>
    </form></div>`;
}
function bindGuide(p) {
  const btn = $('#guideBtn'), form = $('#guideForm'); if (!form) return;
  btn.addEventListener('click', () => { form.hidden = false; btn.hidden = true; $('input[name=first]', form).focus(); track('guide_open', p.id); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form)), out = $('.ok', form);
    const first = (d.first || '').trim(), last = (d.last || '').trim(), email = (d.email || '').trim();
    out.style.color = 'var(--salina)';
    if (!first || !last || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { out.textContent = t('guide_err'); return; }
    $('button[type=submit]', form).disabled = true;
    const r = await fn('web-contact', { kind: 'guide', ...formMeta('guideForm', p), name: `${first} ${last}`, first, last, first_name: first, last_name: last, email,
      message: `${t('guide_msg')}\n${t('nl_first')}: ${first}\n${t('nl_last')}: ${last}\n${t('sh_ref')} ${p.reference}`,
      website: d.website }).catch(() => ({ ok: false }));
    $('button[type=submit]', form).disabled = false;
    if (r.ok) { track('guide_request', p.id); form.innerHTML = `<p class="gb-done">${ICON.check}<span>${t('guide_ok', first)}</span></p>`; }
    else { out.textContent = t('form_err'); }
  });
}
// ---------- hypotheekcalculator (annuïteit) ----------
function mortgageHtml(p) {
  const rate = S.cfg.mortgage_rate_pct || 3.13;
  return `<div class="box mort" id="mortBox"><h3>${t('mort_h')}</h3><p class="mhint">${ICON.hand}${t('mort_hint')}</p>
    <label class="mrow"><span>${t('mort_amount')}</span><span class="eurin"><b>€</b><input id="mAmt" inputmode="numeric" value="${num(p && p.price ? Math.round(p.price * 0.7 / 1000) * 1000 : 250000)}" aria-label="${t('mort_amount')}"></span></label>
    ${p && p.price ? `<div class="mquick"><button type="button" data-ltv="60">60% ${t('mort_of_price')}</button><button type="button" data-ltv="70">70%</button><button type="button" data-ltv="80">80%</button></div>` : ''}
    <label class="mrow"><span>${t('mort_term')}</span><b id="mTermV">25 ${t('mort_years')}</b></label>
    <input type="range" id="mTerm" min="5" max="30" step="1" value="25" aria-label="${t('mort_term')}">
    <label class="mrow"><span>${t('mort_rate')}</span><span class="pctin"><input id="mRate" inputmode="decimal" value="${String(rate).replace('.', dec())}" aria-label="${t('mort_rate')}"><b>%</b></span></label>
    <div class="mout"><span>${t('mort_monthly')}</span><strong id="mPay">–</strong></div>
    <div class="mmeta"><span>${t('mort_interest')} <b id="mInt">–</b></span><span>${t('mort_total')} <b id="mTot">–</b></span></div>
    <p class="mnote">${t('mort_note', String(rate).replace('.', dec()))}</p></div>`;
}
function bindMortgage(p) {
  const box = $('#mortBox'); if (!box) return;
  const parseAmt = v => Number(String(v).replace(/[^0-9]/g, '')) || 0;
  const parseRate = v => Number(String(v).replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
  const calc = () => {
    const P = parseAmt($('#mAmt').value), n = Number($('#mTerm').value) * 12, r = parseRate($('#mRate').value) / 100 / 12;
    $('#mTermV').textContent = `${$('#mTerm').value} ${t('mort_years')}`;
    if (!P || !n) return;
    const m = r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
    const pay = $('#mPay'), nv = eur(Math.round(m));
    if (pay.textContent !== nv) { pay.textContent = nv; pay.classList.remove('bump'); void pay.offsetWidth; pay.classList.add('bump'); }
    $('#mInt').textContent = eur(Math.round(m * n - P));
    $('#mTot').textContent = eur(Math.round(m * n));
  };
  let tracked = false;
  const onInput = () => { calc(); if (!tracked) { tracked = true; track('mortgage', p && p.id); } };
  $('#mAmt').addEventListener('input', onInput);
  $('#mAmt').addEventListener('blur', () => { $('#mAmt').value = num(parseAmt($('#mAmt').value)); });
  $('#mTerm').addEventListener('input', onInput);
  $('#mRate').addEventListener('input', onInput);
  $$('[data-ltv]', box).forEach(b => b.addEventListener('click', () => { $('#mAmt').value = num(Math.round(p.price * b.dataset.ltv / 100 / 1000) * 1000); onInput(); }));
  calc();
}
function openViewForm(name = 'web-property-viewing', kind = 'viewing') {
  const f = $('#viewForm'); if (!f) return null;
  const ta = $('textarea', f), k = $('input[name=kind]', f);
  if (f.dataset.vmsg === undefined) f.dataset.vmsg = ta.value;
  if (kind === 'viewing' && k.value !== 'viewing') ta.value = f.dataset.vmsg;
  k.value = kind; f.dataset.fname = name; f.hidden = false;
  return f;
}
function contactFields(kind, p) {
  return `<input type="hidden" name="kind" value="${kind}">
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input name="name" placeholder="${t('form_name')}" autocomplete="name" aria-label="${t('form_name')}">
    <input name="email" type="email" placeholder="${t('form_email')}" autocomplete="email" aria-label="${t('form_email')}">
    <input name="phone" type="tel" placeholder="${t('form_phone')}" autocomplete="tel" aria-label="${t('form_phone')}">
    <textarea name="message" rows="3" aria-label="${t('form_msg')}">${kind === 'viewing' && p ? esc(t('viewing_msg', p.reference)) : ''}</textarea>
    <button class="btn primary" type="submit">${t('form_send')}</button><p class="ok" aria-live="polite"></p>`;
}
function bindForm(form, p) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    // losse velden: als eigen veld (data-k) mee voor de intake, en leesbaar bovenaan het bericht
    const loose = {};
    $$('[data-x]', form).forEach(i => { const v = i.value.trim(); if (v && i.dataset.k) loose[i.dataset.k] = v; });
    const extra = $$('[data-x]', form).map(i => i.value.trim() ? `${i.dataset.x}: ${i.value.trim()}` : '').filter(Boolean);
    if (extra.length) d.message = extra.join('\n') + (d.message ? '\n\n' + d.message : '');
    const out = $('.ok', form);
    if (!/\S+@\S+\.\S+/.test(d.email || '') && (d.phone || '').length < 6) { out.style.color = 'var(--salina)'; out.textContent = t('form_err'); return; }
    $('button[type=submit]', form).disabled = true;
    const r = await fn('web-contact', { ...d, ...loose, ...formMeta(form.id, p, form.dataset.fname) }).catch(() => ({ ok: false }));
    out.style.color = ''; out.textContent = r.ok ? t('form_ok') : t('form_err');
    if (r.ok) { track('contact_sent', p?.id || null, null, { kind: d.kind }); $$('input,textarea', form).forEach(i => i.type !== 'hidden' && !i.dataset.keep && (i.value = '')); }
    $('button[type=submit]', form).disabled = false;
  });
}
function bindSheet(p, waHref) {
  const inner = $('#sheetInner');
  $$('[data-close]', inner).forEach(b => b.addEventListener('click', closeSheet));
  $$('[data-step]', inner).forEach(b => b.addEventListener('click', () => step(Number(b.dataset.step))));
  $$('[data-track]', inner).forEach(a => a.addEventListener('click', () => track(a.dataset.track, p.id)));
  $('#shShare').addEventListener('click', async () => {
    const url = location.href;
    try { if (navigator.share) await navigator.share({ title: title(p), url }); else { await navigator.clipboard.writeText(url); $('#shShare').style.background = 'var(--lemon-soft)'; } } catch {}
    track('share', p.id);
  });
  $('#viewBtn').addEventListener('click', () => { const f = $('#viewForm'); if (f.hidden) openViewForm(); else f.hidden = true; if (!f.hidden) { $('input[name=name]', f).focus(); track('contact_open', p.id); } });
  bindForm($('#viewForm'), p);
  bindGuide(p);
  bindMortgage(p);
  renderSocialSheet(p);
  $$('.quick-acts [data-go]', inner).forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.go, el = $('#' + id); if (!el) return;
    track('quick_action', p.id, null, { id });
    el.scrollIntoView({ behavior: 'smooth', block: id === 'gal' ? 'start' : 'center' });
    if (id === 'chatBox') setTimeout(() => $('#chatIn').focus({ preventScroll: true }), 500);
    if (id === 'viewBtn') setTimeout(() => { openViewForm(); }, 400);
    if (id === 'guideBox') setTimeout(() => { const f = $('#guideForm'); if (f) { f.hidden = false; $('#guideBtn').hidden = true; } }, 400);
    if (id === 'mortBox' || id === 'chatBox' || id === 'guideBox') { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); }
  }));
  // chat
  const hist = [];
  const log = $('#chatLog');
  setTimeout(() => { const intro = $('.intro', log); if (intro) { intro.classList.remove('typing-dots'); intro.textContent = t('ask_intro'); } }, 1100);
  const ask = async q => {
    q = q.trim(); if (!q) return;
    $('#chatSugg').innerHTML = '';
    log.insertAdjacentHTML('beforeend', `<div class="msg u">${esc(q)}</div><div class="msg a typing">…</div>`);
    log.scrollTop = log.scrollHeight;
    track('assistant', p.id);
    const r = await fn('web-assistant', { mode: 'ask', lang: S.lang, id: p.id, reference: p.reference, wp_id: p.wp_id || null, query: q, history: hist }).catch(() => ({}));
    const reply = r.reply || tx({ en: "I'm not sure about that. Feel free to WhatsApp us.", nl: 'Dat weet ik niet zeker. Stuur ons gerust een WhatsApp.', sv: 'Det är jag inte säker på. Skicka gärna ett WhatsApp till oss.' });
    hist.push({ role: 'user', content: q }, { role: 'assistant', content: reply });
    $('.typing', log).remove();
    log.insertAdjacentHTML('beforeend', `<div class="msg a">${esc(reply)}${r.handoff ? `<br><br>${t('handoff')} <a href="${waHref}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</div>`);
    log.scrollTop = log.scrollHeight;
    if (r.handoff) { openViewForm('web-property-viewing-assistant'); }
    $('#chatSugg').innerHTML = (r.suggestions || []).slice(0, 3).map(s => `<button type="button">${esc(s)}</button>`).join('');
  };
  $('#chatSugg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) ask(b.textContent); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { $('#chatFab').hidden = es[0].isIntersecting; }, { root: $('#sheetInner'), threshold: .3 }).observe($('#chatBox'));
  $('#chatFab').addEventListener('click', () => { $('#chatBox').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#chatIn').focus({ preventScroll: true }), 400); track('assistant_fab', p.id); });
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#chatIn').value; $('#chatIn').value = ''; ask(v); });
}
function fillFacts(p) {
  const kf = [];
  const add = (v, l) => v != null && v !== '' && kf.push(`<div><b>${v}</b><span>${l}</span></div>`);
  add(p.bedrooms, t('sh_bed')); add(p.bathrooms, t('sh_bath'));
  add(p.build_area && num(p.build_area) + ' m²', t('sh_built')); add(p.plot_area && num(p.plot_area) + ' m²', t('sh_plot'));
  add(dist(p.dist_sea_m), t('sh_sea'));
  if (p.pool_private) add(`<i class="kf-ic own">${ICON.pool}</i>`, t('pool_private'));
  if (p.pool_communal) add(`<i class="kf-ic shared">${ICON.poolC}</i>`, t('pool_communal'));
  $('#keyfacts').innerHTML = kf.join('');
}
function fillDetail(d) {
  const kf = $('#keyfacts');
  const extra = [];
  const add = (v, l) => v != null && v !== '' && extra.push(`<div><b>${esc(v)}</b><span>${l}</span></div>`);
  add(dist(d.dist_shops_m), t('sh_shops'));
  add(d.year_built, t('sh_year')); add(d.energy_label && d.energy_label !== 'R' ? d.energy_label : null, t('sh_energy'));
  add(d.orientation && cap(d.orientation), t('sh_orient'));
  kf.insertAdjacentHTML('beforeend', extra.join(''));
  // market position
  if (!d.is_newbuild && d.market_deviation_pct != null && d.market_n >= 5) {
    const dev = Math.round(d.market_deviation_pct);
    const posPct = Math.max(3, Math.min(97, 50 + dev * 1.2));
    $('#marketBox').innerHTML = `<div class="market"><h3>${t('market_h')}</h3>
      <div class="mbar"><i style="left:${posPct}%"></i><em style="left:${posPct}%">${dev > 0 ? '+' : ''}${dev}%</em></div>
      <div class="mlegend"><span>${t('cheaper')}</span><span>${t('pricier')}</span></div>
      <p style="margin:10px 0 0">${t('market_txt', dev, eur(d.market_median_m2), d.market_n, d.town)}</p></div>`;
  }
  // description
  let body = S.lang === 'nl' ? (d.body_nl || d.body_en) : S.lang === 'sv' ? (d.body_sv || d.body_en || d.body_nl) : (d.body_en || d.body_nl);
  if (body) {
    // partnerteksten: dubbel ge-escapete entiteiten herstellen en losse regels als alinea's tonen
    body = body.replace(/&amp;(nbsp|amp|quot|apos|lt|gt|#\d+);/g, '&$1;');
    if (!/<(p|br|ul|ol|li|h[2-4])\b/i.test(body)) body = body.split(/\n\s*\n+/).map(x => x.trim()).filter(Boolean).map(x => `<p>${x.replace(/\n/g, '<br>')}</p>`).join('');
  }
  const desc = $('#desc');
  if (body) {
    desc.innerHTML = `<h3>${t('desc_h')}</h3>` + sanitize(body);
    // plaatsnamen linken naar de woonplaatsgids (zelfde regels als de statische pagina, R.linkTowns)
    const lang = S.lang, raw = body, tok = String(d.id) + '|' + lang;
    desc.dataset.tok = tok;
    townGuides().then(list => { if (desc.dataset.tok === tok && S.lang === lang && list && list.length) { const h = desc.querySelector('h3'); desc.innerHTML = (h ? h.outerHTML : '') + R.linkTowns(sanitize(raw), list, lang); } }).catch(() => {});
    if (desc.textContent.length > 900) {
      desc.classList.add('clamp');
      desc.insertAdjacentHTML('afterend', `<button class="btn ghost" type="button" id="readMore" style="margin:6px 0 10px">${t('read_more')}</button>`);
      $('#readMore').addEventListener('click', e => { desc.classList.remove('clamp'); e.target.remove(); track('read_more', d.id); });
    }
  } else desc.innerHTML = d.summary_en ? `<p>${esc(d.summary_en)}</p>` : '';
  // features
  const feats = [];
  if (d.pool_private) feats.push(t('pool_private')); if (d.pool_communal) feats.push(t('pool_communal'));
  if (d.aircon) feats.push(t('aircon')); if (d.solarium) feats.push(t('solarium'));
  (d.features || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => feats.push(cap(s)));
  (d.terraces || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => feats.push(cap(s) + tx({ en: ' terrace', nl: ' terras', sv: ' terrass' })));
  if (feats.length) $('#featBox').innerHTML = `<div class="feat" style="margin:20px 0"><h3>${t('feat_h')}</h3><ul>${[...new Set(feats)].map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
  // costs: belastingtarieven uit web_config; wij werken met één vast all-in tarief, geen losse rekeningen
  if (d.price) {
    const c = S.cfg;
    const rate = d.is_newbuild ? c.iva_newbuild_pct + c.ajd_newbuild_pct : c.itp_resale_pct;
    const tax = Math.round(d.price * rate / 100);
    const pct = v => String(v).replace('.', dec());
    const taxLbl = d.is_newbuild ? t('costs_tax_new', pct(c.iva_newbuild_pct), pct(c.ajd_newbuild_pct)) : t('costs_tax_resale', pct(c.itp_resale_pct));
    const rows = [[t('costs_price'), d.price], [taxLbl, tax]];
    const allIn = c.buyer_all_in_eur > 0 ? c.buyer_all_in_eur : null;
    if (allIn) rows.push([t('costs_allin'), allIn]);
    const total = rows.reduce((s, r) => s + Number(r[1] || 0), 0);
    $('#costBox').innerHTML = `<div class="costs"><h3>${t('costs_h')}</h3><table>${rows.map(r => `<tr><td>${r[0]}</td><td>${eur(r[1])}</td></tr>`).join('')}
      <tr class="total"><td>${allIn ? t('costs_total') : t('costs_total_ex')}</td><td>${eur(total)}</td></tr></table>
      <div class="allin"><b>${t('allin_h')}</b><p>${t('allin_p')}</p>
        <ul class="allin-factors">${t('allin_factors').map(f => `<li>${f}</li>`).join('')}</ul>
        <p>${t('allin_ask')}</p>
        <div class="allin-cta"><button type="button" class="btn primary" id="costAsk">${t('allin_btn')}</button>
        <a class="btn wa" href="https://wa.me/${agentOf(d).tel.replace('+', '')}?text=${encodeURIComponent(t('allin_wa', d.reference))}" target="_blank" rel="noopener" data-track="whatsapp_costs">WhatsApp</a></div></div>
      <p class="note">${t('costs_note')}</p></div>`;
    $('#costAsk').addEventListener('click', () => {
      const f = openViewForm('web-property-costs', 'costs');
      $('textarea', f).value = t('allin_msg', d.reference);
      f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('input[name=name]', f).focus({ preventScroll: true }), 450);
      track('costs_ask', d.id);
    });
  }
}
function gallery(urls) {
  const track_ = $('#galTrack'), thumbs = $('#thumbs'), count = $('#galCount');
  if (!track_ || !urls.length) return;
  track_.innerHTML = urls.map((u, i) => `<img src="${esc(u)}" alt="" ${i > 1 ? 'loading="lazy"' : ''}>`).join('');
  thumbs.innerHTML = urls.length > 1 ? urls.map((u, i) => `<img src="${esc(u)}" alt="" loading="lazy" data-i="${i}" class="${i ? '' : 'on'}">`).join('') : '';
  thumbs.hidden = urls.length < 2;
  const go = i => { i = (i + urls.length) % urls.length; track_.scrollTo({ left: i * track_.clientWidth, behavior: 'smooth' }); };
  const cur = () => Math.round(track_.scrollLeft / track_.clientWidth);
  const upd = () => { const i = cur(); count.textContent = `${i + 1} / ${urls.length}`; $$('img', thumbs).forEach((t, k) => t.classList.toggle('on', k === i)); };
  upd();
  let seen = 0;
  track_.addEventListener('scroll', () => { upd(); const i = cur(); if (i > seen) { seen = i; if (i === 3 || i === 10) track('gallery', S.openId, i); } }, { passive: true });
  $('.gal .prev').onclick = () => go(cur() - 1);
  $('.gal .next').onclick = () => go(cur() + 1);
  thumbs.onclick = e => { const i = e.target.dataset.i; if (i != null) go(Number(i)); };
  $('.gal .prev').hidden = $('.gal .next').hidden = urls.length < 2;
  $('#galFs').onclick = () => openLightbox(urls, cur());
  track_.ondblclick = () => openLightbox(urls, cur());
}
function similar(p, n = 10) {
  const base = S.all.filter(x => x.id !== p.id && x.image);
  const near = base.filter(x => x.category === p.category && x.price && p.price && Math.abs(x.price - p.price) / p.price < .35)
    .sort((a, b) => (b.town === p.town) - (a.town === p.town) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price));
  return near.slice(0, n);
}
function renderMore(p) {
  areaLink(p);
  const sim = similar(p);
  const area = S.all.filter(x => x.town === p.town && x.id !== p.id && x.image && !sim.includes(x)).slice(0, 10);
  $('#shMore').innerHTML = (sim.length ? `<h2>${t('similar_h')}</h2><div class="rail">${sim.map(x => card(x)).join('')}</div>` : '')
    + (area.length > 2 ? `<h2>${esc(t('area_h', p.town))}</h2><div class="rail">${area.map(x => card(x)).join('')}</div>` : '');
}
function step(d) {
  const list = S.order.length ? S.order : S.all;
  const i = list.findIndex(x => x.id === S.openId);
  const nx = list[(i + d + list.length) % list.length];
  if (nx) { track('step', nx.id, d); go(ph(nx), { replace: true }); }
}
function closeSheetTracking() {
  if (S.openId && S.openSince) track('dwell', S.openId, Math.round((Date.now() - S.openSince) / 1000));
  S.openId = null; S.openSince = 0;
}
function closeSheet() {
  closeSheetTracking();
  $('#sheet').hidden = true; document.body.style.overflow = '';
  if (cur().key !== 'property') return;
  // in de app geopend: terug in de geschiedenis naar de pagina eronder; direct binnengekomen: naar die pagina zonder herladen
  if (S.sheetDepth > 0) { const n = S.sheetDepth; S.sheetDepth = 0; history.go(-n); }
  else history.replaceState(null, '', S.lastRoute || L('home'));
  setTitle();
}
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
document.addEventListener('keydown', e => {
  if ($('#reel') && !$('#reel').hidden && e.key === 'Escape') return closeReel();
  if ($('#sheet').hidden) return;
  if (e.key === 'Escape') closeSheet();
  if (e.target.matches('input,textarea')) return;
  if (e.key === 'ArrowRight' && e.shiftKey) step(1);
  if (e.key === 'ArrowLeft' && e.shiftKey) step(-1);
});
window.addEventListener('pagehide', closeSheetTracking);

// ---------- lightbox: foto's schermvullend ----------
function openLightbox(urls, start = 0, plain = false) {
  const p = plain ? null : S.byId.get(S.openId);
  const lb = document.createElement('div');
  lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', t('fullscreen'));
  lb.innerHTML = `<div class="lb-track">${urls.map((u, i) => `<figure><img src="${esc(u)}" alt="" ${Math.abs(i - start) > 2 ? 'loading="lazy"' : ''}></figure>`).join('')}</div>
    <div class="lb-top"><span class="lb-ref">${p ? esc(p.reference) + ' · ' + esc(title(p)) : ''}</span><span class="lb-count"></span>
    <button type="button" class="lb-close" aria-label="${t('close')}">${ICON.x}</button></div>
    <button type="button" class="lb-nav lb-prev" aria-label="Previous">${ICON.l}</button><button type="button" class="lb-nav lb-next" aria-label="Next">${ICON.r}</button>
    <div class="lb-bottom">${p ? `<span class="lb-price">${p.price != null ? eur(p.price) : ''}</span><button type="button" class="btn lemon" id="lbAsk">${t('qa_ask')}</button><button type="button" class="btn primary" id="lbView">${t('qa_view')}</button>` : ''}</div>`;
  document.body.appendChild(lb);
  const tr = $('.lb-track', lb), count = $('.lb-count', lb);
  const cur = () => Math.round(tr.scrollLeft / tr.clientWidth);
  const go = i => tr.scrollTo({ left: ((i + urls.length) % urls.length) * tr.clientWidth, behavior: 'smooth' });
  const upd = () => { count.textContent = `${cur() + 1} / ${urls.length}`; };
  requestAnimationFrame(() => { tr.scrollLeft = start * tr.clientWidth; upd(); });
  tr.addEventListener('scroll', upd, { passive: true });
  const close = () => { document.removeEventListener('keydown', key, true); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); lb.remove(); };
  const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } if (e.key === 'ArrowRight') go(cur() + 1); if (e.key === 'ArrowLeft') go(cur() - 1); };
  document.addEventListener('keydown', key, true);
  $('.lb-close', lb).onclick = close;
  $('.lb-prev', lb).onclick = () => go(cur() - 1);
  $('.lb-next', lb).onclick = () => go(cur() + 1);
  const ask = $('#lbAsk', lb); if (ask) ask.onclick = () => { close(); $('#chatBox').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#chatIn').focus({ preventScroll: true }), 450); };
  const vw = $('#lbView', lb); if (vw) vw.onclick = () => { close(); openViewForm('web-property-viewing-gallery'); $('#viewForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  if (lb.requestFullscreen && matchMedia('(pointer: fine)').matches) lb.requestFullscreen().catch(() => {});
  track('fullscreen', plain ? null : S.openId, urls.length);
}

// ---------- REEL: full-screen vertical browse ----------
function openReel(startIdx) {
  const list = (S.order.length ? S.order : computeOrder()).filter(p => p.image).slice(0, 120);
  const reel = $('#reel');
  reel.innerHTML = `<button class="reel-close" type="button" aria-label="${t('close')}">${ICON.x}</button><span class="reel-hint">${tx({ en: 'Swipe up for the next home', nl: 'Veeg omhoog voor de volgende woning', sv: 'Svep uppåt för nästa bostad' })}</span>` +
    list.map((p, i) => `<section class="reel-item" data-id="${p.id}"><img src="${esc(p.image)}" alt="${esc(title(p))}" loading="${i < 2 ? 'eager' : 'lazy'}"><span class="ref-tag reel-ref">${esc(p.reference)}</span>
      <div class="reel-cap"><div class="t"><div class="badges" style="display:flex;gap:6px;margin-bottom:6px">${badges(p)}</div>${priceHtml(p)}<h3>${esc(title(p))}</h3>${specs(p)}</div>
      <div class="reel-side"><button type="button" data-fav="${p.id}" aria-pressed="${S.favs.has(p.id)}" aria-label="Save">${ICON.heart}</button>
      <button type="button" data-open="${esc(p.reference)}" aria-label="Details">${ICON.info}</button>
      <button type="button" data-wa="${p.id}" aria-label="WhatsApp">${ICON.wa}</button></div></div></section>`).join('');
  reel.hidden = false; document.body.style.overflow = 'hidden';
  $('.reel-close', reel).onclick = closeReel;
  reel.onclick = e => {
    const o = e.target.closest('[data-open]'); if (o) { closeReel(); go(ph(S.byRef.get(o.dataset.open) || o.dataset.open)); return; }
    const w = e.target.closest('[data-wa]'); if (w) { const p = S.byId.get(w.dataset.wa); const ag = agentOf(p); track('whatsapp', p.id); window.open(`https://wa.me/${ag.tel.replace('+', '')}?text=${encodeURIComponent(t('wa_text', p.reference))}`, '_blank', 'noopener'); }
  };
  let seen = new Set();
  const obs = new IntersectionObserver(es => es.forEach(en => {
    en.target.classList.toggle('on', en.isIntersecting);
    const id = en.target.dataset.id;
    if (en.isIntersecting && !seen.has(id)) { seen.add(id); track('reel_view', id); }
  }), { root: reel, threshold: .6 });
  $$('.reel-item', reel).forEach(x => obs.observe(x));
  reel.scrollTop = startIdx * innerHeight;
  setTimeout(() => $('.reel-hint') && $('.reel-hint').remove(), 3500);
  track('reel_open');
}
function closeReel() { $('#reel').hidden = true; $('#reel').innerHTML = ''; document.body.style.overflow = ''; }

// ---------- CONTENT PAGES (teksten in js/pages.js) ----------
const P = k => (PAGES[S.lang] || PAGES.en)[k];
function homesRail(h) {
  const pr = prefs();
  const items = S.all.filter(p => p.image && isOpen(p)).sort((a, b) => score(b, pr) - score(a, pr)).slice(0, 12);
  if (!items.length) return '';
  return `<section class="section"><h2>${h || t('home_rail')}</h2><div class="rail">${items.map(p => card(p)).join('')}</div><p><a class="btn ghost" href="${L('home')}">${t('see_all')}</a></p></section>`;
}
const timeline = steps => `<ol class="tl">${steps.map(([h, p], i) => `<li><span class="tl-n">${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol>`;
// formulier: velden met data-x gaan als los veld (data-k) mee én als regel bovenaan het bericht
function richForm(id, kind, extra, msg) {
  return `<form class="form rich" id="${id}">
    <input type="hidden" name="kind" value="${kind}"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="row2"><label><span>${t('form_name')}</span><input name="name" autocomplete="name"></label><label><span>${t('form_phone')}</span><input name="phone" type="tel" autocomplete="tel"></label></div>
    <label><span>${t('form_email')}</span><input name="email" type="email" autocomplete="email"></label>
    ${extra.length ? `<div class="row2">${extra.map(x => `<label><span>${x.label}</span>${x.opts
      ? `<select data-x="${esc(x.label)}" data-k="${x.k}"><option value="">–</option>${x.opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>`
      : `<input data-x="${esc(x.label)}" data-k="${x.k}"${x.ph ? ` placeholder="${esc(x.ph)}"` : ''}>`}</label>`).join('')}</div>` : ''}
    <label><span>${t('form_msg')}</span><textarea name="message" rows="4"${msg ? ` data-keep="1"` : ''}>${msg ? esc(msg) : ''}</textarea></label>
    <button class="btn primary" type="submit">${t('form_send')}</button><p class="ok" aria-live="polite"></p>
    <p class="form-note">${t('form_privacy')} <a href="${L('privacy')}">${t('privacy')}</a></p></form>`;
}
function pageBuy() {
  const c = P('buy');
  return `<section class="page-hero short">${video(VIDEO.coast)}<div><p class="kicker">${t('nav_buy')}</p><h1>${c.h}</h1><p>${c.lead}</p><p class="hero-acts"><a class="btn lemon" href="${L('home')}">${t('see_all')}</a><a class="btn wa" href="https://wa.me/34664414515" target="_blank" rel="noopener" data-track="whatsapp">WhatsApp</a></p></div></section>
    <div class="pg">
      <p class="pg-intro">${c.intro}</p>
      <div class="buy-grid">
        <div><h2 class="pg-h">${c.steps_h}</h2>${timeline(c.steps)}</div>
        <aside class="box costs-card"><h2>${c.costs_h}</h2><ul class="ticks">${c.costs.map(x => `<li>${x}</li>`).join('')}</ul>
          <div class="allin-note">${c.costs_note}</div><a class="btn primary" href="#buyForm" data-scroll>${c.cta}</a></aside>
      </div>
      <div class="pg-2 fin-row">${mortgageHtml(null)}<div class="box fin-card"><h3>${c.fin_h}</h3><p>${c.fin_p}</p><a class="btn ghost" href="#buyForm" data-scroll>${c.cta}</a></div></div>
      <h2 class="pg-h">${c.services_h}</h2><ul class="svc">${c.services.map(x => `<li>${ICON.check}<span>${x}</span></li>`).join('')}</ul>
    </div>
    ${homesRail()}
    <section class="pg form-band"><div><h2>${c.cta}</h2><p>${c.costs_note}</p></div>
      ${richForm('buyForm', 'costs', [{ k: 'budget', label: t('f_budget'), ph: '€' }, { k: 'timing', label: t('f_when'), opts: t('f_when_opts') }], t('f_buy_msg'))}</section>`;
}
function pageSell() {
  const c = P('sell');
  return `<section class="page-hero">${video(VIDEO.villa)}<div><p class="kicker">${t('nav_sell')}</p><h1>${c.h}</h1><p>${c.lead}</p><p class="hero-acts"><a class="btn lemon" href="#sellForm" data-scroll>${c.form_h}</a></p></div></section>
    <div class="pg">
      <div class="feats">${c.feats.map(([h, p]) => `<div class="feat"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
      <div class="pg-2 tight">
        <div><h2 class="pg-h">${c.steps_h}</h2>${timeline(c.steps)}</div>
        <div class="box form-card" id="sellBox"><h2>${c.form_h}</h2><p>${c.form_p}</p>
          ${richForm('sellForm', 'valuation', [{ k: 'area', label: t('f_town'), ph: 'Rojales, Ciudad Quesada…' }, { k: 'property_type', label: t('f_type'), opts: t('f_type_opts') }], '')}</div>
      </div>
      <div class="cta-band"><p>${c.legal}</p><a class="btn ghost" href="${L('contact')}">${t('nav_contact')}</a></div>
    </div>`;
}
function pageMove() {
  const c = P('move');
  return `<section class="page-hero">${video(VIDEO.village)}<div><p class="kicker">${t('nav_move')}</p><h1>${c.h}</h1><p>${c.lead}</p></div></section>
    <div class="pg">
      <div class="stages">${c.stages.map(([h, p], i) => `<div class="stage"><span>${i + 1}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
      <p class="move-areas"><a href="${L('area')}">${t('areas_h')}: ${tx({ en: 'read about schools, healthcare, shops and festivals per town', nl: 'lees per woonplaats over scholen, zorg, winkels en feesten', sv: 'läs om skolor, vård, affärer och fester ort för ort' })} →</a></p>
      <div class="buy-grid move-grid">
        <div class="acc">${c.topics.map(([h, p], i) => `<details${i === 0 ? ' open' : ''}><summary>${h}</summary><p>${p}</p></details>`).join('')}
          <p class="disclaimer">${c.disclaimer}</p></div>
        <aside class="box side-cta"><h2>${c.form_h}</h2><p>${c.form_p}</p>
          <ul class="ticks">${c.topics.map(([h]) => `<li>${h.split(':')[0]}</li>`).join('')}</ul>
          <a class="btn lemon" href="#moveForm" data-scroll>${t('move_plan_btn')}</a>
          <a class="btn wa" href="https://wa.me/34664414515" target="_blank" rel="noopener" data-track="whatsapp">WhatsApp</a></aside>
      </div>
    </div>
    ${homesRail()}
    <section class="pg form-band"><div><h2>${c.form_h}</h2><p>${c.form_p}</p></div>
      ${richForm('moveForm', 'move', [{ k: 'timing', label: t('f_when'), opts: t('f_when_opts') }, { k: 'budget', label: t('f_budget'), ph: '€' }, { k: 'household', label: t('f_household'), ph: t('f_household_ph') }, { k: 'area', label: t('f_area'), ph: t('f_area_ph') }], '')}</section>`;
}
const LANG_NAME = { es: { en: 'Spanish', nl: 'Spaans', sv: 'spanska' }, nl: { en: 'Dutch', nl: 'Nederlands', sv: 'nederländska' }, en: { en: 'English', nl: 'Engels', sv: 'engelska' }, de: { en: 'German', nl: 'Duits', sv: 'tyska' }, fr: { en: 'French', nl: 'Frans', sv: 'franska' }, ca: { en: 'Valencian', nl: 'Valenciaans', sv: 'valencianska' }, sv: { en: 'Swedish', nl: 'Zweeds', sv: 'svenska' } };
// taal van het artikel zelf (de koppen in news_posts zijn al naar het Nederlands herschreven)
const artLang = r => ({ idealista: 'es', 'vegabajadigital.com': 'es', 'Spanje Vandaag': 'nl' }[r.source]);
const NEWS_SRC = { all: null, market: 'idealista', region: 'vegabajadigital.com', spain: 'Spanje Vandaag' };
// ---------- nieuws: eigen blog (core.blog_posts via web_blog_posts) met detailpagina #/news/<slug>;
// zolang er nog geen blogposts zijn: de koppen uit web_news als lijst met externe links (geen lege pagina)
const fmtDate = (d, y) => d ? new Date(d).toLocaleDateString(loc(), y ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' }) : '';
function sanitizeRich(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,noscript,template,form,input,button,link,meta,svg,math').forEach(n => n.remove());
  const ok = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'BR', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'A', 'IMG', 'FIGURE', 'FIGCAPTION', 'HR']);
  const walk = n => {
    [...n.children].forEach(c => {
      walk(c);
      if (c.tagName === 'H1') { const h = doc.createElement('h2'); h.append(...c.childNodes); c.replaceWith(h); return; }
      if (!ok.has(c.tagName)) { c.replaceWith(...c.childNodes); return; }
      const href = c.getAttribute('href'), src = c.getAttribute('src'), alt = c.getAttribute('alt');
      [...c.attributes].forEach(a => c.removeAttribute(a.name));
      if (c.tagName === 'A') {
        if (href && /^(https?:|mailto:|#\/|\/(en|nl|sv)\/)/i.test(href.trim())) { c.setAttribute('href', href.trim()); if (/^https?:/i.test(href.trim())) { c.setAttribute('target', '_blank'); c.setAttribute('rel', 'noopener nofollow'); } }
        else c.replaceWith(...c.childNodes);
      }
      if (c.tagName === 'IMG') {
        if (src && /^https:\/\//i.test(src.trim())) { c.setAttribute('src', src.trim()); c.setAttribute('alt', alt || ''); c.setAttribute('loading', 'lazy'); c.setAttribute('referrerpolicy', 'no-referrer'); }
        else c.remove();
      }
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
async function pageNews(slug) {
  if (slug) return pagePost(slug);
  $('#main').innerHTML = `<div class="page-head"><p class="kicker">${t('nav_news')}</p><h1>${t('news_h')}</h1><p>${t('news_p')}</p></div>
    <div class="news-filter" id="newsFilter" role="group" hidden></div>
    <div class="news-grid" id="newsList">${'<div class="skeleton" style="height:150px;border-radius:14px"></div>'.repeat(6)}</div>
    <div class="loadmore"><button class="btn ghost" id="newsMore" type="button" hidden>${t('news_more')}</button></div>${homesRail()}`;
  observeCards($('#main'));
  const posts = await api('web_blog_posts?select=id,group_id,lang,slug,title,excerpt,image_url,source_name,category,published_at&order=published_at.desc.nullslast&limit=300').catch(() => []);
  if (currentPage !== 'news') return;
  if (posts.length) return blogList(posts);
  return newsLinks();
}
function blogList(posts) {
  // per artikelgroep één versie: in de taal van de site als die er is, anders de andere taal
  const groups = new Map();
  posts.forEach(p => { const k = p.group_id || p.id; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p); });
  const rows = [...groups.values()].map(g => g.find(p => (p.lang || '').toLowerCase() === S.lang) || g.find(p => (p.lang || '').toLowerCase() === 'en') || g[0])
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  const cats = [...new Set(rows.map(r => r.category).filter(Boolean))];
  let cat = null, shown = 17;
  const fl = $('#newsFilter');
  if (cats.length > 1) {
    fl.hidden = false;
    fl.innerHTML = [`<button type="button" data-cat="" aria-pressed="true">${t('news_all')}</button>`, ...cats.map(c => `<button type="button" data-cat="${esc(c)}" aria-pressed="false">${esc(cap(String(c).replace(/[_-]/g, ' ')))}</button>`)].join('');
    $$('button', fl).forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat || null; shown = 17; $$('button', fl).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); track('news_filter', null, null, { cat }); }));
  }
  const draw = () => {
    const list = rows.filter(r => !cat || r.category === cat);
    const li = list.findIndex(r => r.image_url); if (li > 0 && li < 4) list.unshift(list.splice(li, 1)[0]);
    $('#newsList').innerHTML = list.slice(0, shown).map((r, i) => `<a class="news-card${i === 0 ? ' lead' : ''}${r.image_url ? ' has-img' : ''}" href="${L('news', r.slug)}" data-src="blog">
      ${r.image_url ? `<span class="nc-img"><img src="${esc(r.image_url)}" alt="" loading="${i < 5 ? 'eager' : 'lazy'}" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('nc-ph');this.remove();"></span>` : (i ? `<span class="nc-img nc-ph"></span>` : '')}
      <span class="nc-txt"><span class="nc-tag">${esc(r.category ? cap(String(r.category).replace(/[_-]/g, ' ')) : 'Soltura')}</span><h3>${esc(r.title)}</h3>${r.excerpt && i === 0 ? `<p class="nc-ex">${esc(r.excerpt)}</p>` : ''}<small>${r.source_name ? esc(r.source_name) + ' · ' : ''}${fmtDate(r.published_at)}${(r.lang || '').toLowerCase() !== S.lang && LANG_NAME[(r.lang || '').toLowerCase()] ? ` · <span class="nc-lang">${t('news_in', LANG_NAME[r.lang.toLowerCase()][S.lang])}</span>` : ''}</small></span></a>`).join('') || `<p>${t('news_none')}</p>`;
    $('#newsMore').hidden = list.length <= shown;
  };
  draw();
  $('#newsMore').addEventListener('click', () => { shown += 16; draw(); });
  $('#newsList').addEventListener('click', e => { const a = e.target.closest('a'); if (a) track('news_click', null, null, { src: 'blog' }); });
}
async function pagePost(slug) {
  const main = $('#main');
  main.innerHTML = `<article class="post"><p class="kicker"><a href="${L('news')}">← ${t('nav_news')}</a></p><div class="skeleton" style="height:2.4em;border-radius:8px;max-width:640px"></div><div class="skeleton" style="height:16em;border-radius:14px;margin-top:20px"></div></article>`;
  const r = await api(`web_blog_posts?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`).then(x => x[0]).catch(() => null);
  if (currentPage !== 'news' || cur().arg !== slug) return;
  if (!r) {
    main.innerHTML = `<div class="empty"><h2>${tx({ en: 'This article is no longer available', nl: 'Dit bericht is niet (meer) beschikbaar', sv: 'Den här artikeln finns inte längre' })}</h2><p><a class="btn primary" href="${L('news')}">${t('nav_news')}</a></p></div>${homesRail()}`;
    observeCards(main); return;
  }
  // andere taal gekozen en er is een vertaling: daarheen
  if ((r.lang || '').toLowerCase() !== S.lang && r.group_id) {
    const sib = await api(`web_blog_posts?select=slug&group_id=eq.${encodeURIComponent(r.group_id)}&lang=eq.${S.lang}&limit=1`).then(x => x[0]).catch(() => null);
    if (sib && sib.slug && sib.slug !== slug) { go(L('news', sib.slug), { replace: true }); return; }
  }
  document.title = `${r.title} · Grupo Soltura`;
  main.innerHTML = `<article class="post">
      <p class="kicker"><a href="${L('news')}">← ${t('nav_news')}</a></p>
      <h1>${esc(r.title)}</h1>
      <p class="post-meta muted">${fmtDate(r.published_at, true)}${r.source_name ? ' · ' + esc(r.source_name) : ''}</p>
      ${r.image_url ? `<figure class="post-img"><img src="${esc(r.image_url)}" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></figure>` : ''}
      ${r.excerpt ? `<p class="post-lead">${esc(r.excerpt)}</p>` : ''}
      <div class="post-body">${sanitizeRich(r.body_html)}</div>
      ${r.source_url && /^https?:/i.test(r.source_url) ? `<p class="post-src">${tx({ en: 'Source', nl: 'Bron', sv: 'Källa' })}: <a href="${esc(r.source_url)}" target="_blank" rel="noopener nofollow">${esc(r.source_name || new URL(r.source_url).hostname)}</a></p>` : ''}
      <p class="post-share"><a class="btn ghost" href="${L('news')}">${t('news_more')}</a> <a class="btn wa" href="https://wa.me/?text=${encodeURIComponent(r.title + ' ' + location.origin + L('news', r.slug))}" target="_blank" rel="noopener" data-social="share_wa">${t('share_wa')}</a></p>
    </article>${homesRail()}`;
  observeCards(main);
  track('news_view', null, null, { slug: r.slug });
}
async function newsLinks() {
  const fl = $('#newsFilter');
  fl.hidden = false;
  fl.innerHTML = Object.keys(NEWS_SRC).map((k, i) => `<button type="button" data-src="${k}" aria-pressed="${i === 0}">${t('news_' + k)}</button>`).join('');
  const rows = await api('web_news?select=title,title_en,title_nl,lang,url,posted_at,source,image&order=posted_at.desc&limit=200').catch(() => []);
  const fmt = d => new Date(d).toLocaleDateString(loc(), { day: 'numeric', month: 'long' });
  const label = src => ({ idealista: t('news_market'), 'vegabajadigital.com': t('news_region'), 'Spanje Vandaag': t('news_spain') }[src] || src);
  // koppen in de taal van de site (vertaald door web-news-images); het artikel zelf staat in de brontaal
  const head = r => (S.lang === 'nl' ? r.title_nl : r.title_en) || r.title; // SV: Engelse kop // NL: altijd informeel (je/jij)
  let src = 'all', shown = 17;
  const draw = () => {
    const list = rows.filter(r => !NEWS_SRC[src] || r.source === NEWS_SRC[src]);
    // het meest recente bericht mét foto als groot openingsbericht
    const li = list.findIndex(r => r.image); if (li > 0 && li < 4) list.unshift(list.splice(li, 1)[0]);
    $('#newsList').innerHTML = list.slice(0, shown).map((r, i) => `<a class="news-card${i === 0 ? ' lead' : ''}${r.image ? ' has-img' : ''}" href="${esc(r.url)}" target="_blank" rel="noopener" data-src="${esc(r.source)}">
      ${r.image ? `<span class="nc-img"><img src="${esc(r.image)}" alt="" loading="${i < 5 ? 'eager' : 'lazy'}" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('nc-ph');this.remove();"></span>` : (i ? `<span class="nc-img nc-ph"></span>` : '')}
      <span class="nc-txt"><span class="nc-tag">${esc(label(r.source))}</span><h3>${esc(head(r))}</h3><small>${esc(r.source)} · ${fmt(r.posted_at)}${artLang(r) && artLang(r) !== S.lang ? ` · <span class="nc-lang">${t('news_in', LANG_NAME[artLang(r)][S.lang])}</span>` : ''}</small></span></a>`).join('') || `<p>${t('news_none')}</p>`;
    $('#newsMore').hidden = list.length <= shown;
  };
  draw();
  // nieuwe berichten zonder foto: thumbnails laten ophalen voor de volgende bezoeker
  try { if (rows.some(r => !r.image || !r.title_en) && !sessionStorage.getItem('gs_newsimg')) { sessionStorage.setItem('gs_newsimg', '1'); fn('web-news-images', {}).catch(() => {}); } } catch {}
  $$('#newsFilter button').forEach(b => b.addEventListener('click', () => { src = b.dataset.src; shown = 17; $$('#newsFilter button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); track('news_filter', null, null, { src }); }));
  $('#newsMore').addEventListener('click', () => { shown += 16; draw(); });
  $('#newsList').addEventListener('click', e => { const a = e.target.closest('a'); if (a) track('news_click', null, null, { src: a.dataset.src }); });
}
// ---------- kantoorkaart (OpenStreetMap via Leaflet, alleen geladen op de contactpagina) ----------
const OFFICE_LL = [38.0871507, -0.7407113];
// vergaderzaal, trap weggehaald (Higgsfield), als JPEG in Storage web-media
const OFFICE_IMG = MEDIA + 'contact-office.jpg';
let leafletP = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (!leafletP) leafletP = new Promise((ok, no) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'; document.head.appendChild(css);
    const js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'; js.onload = ok; js.onerror = no; document.head.appendChild(js);
  });
  return leafletP;
}
async function initMap() {
  const el = $('#mapEl'); if (!el) return;
  try { await loadLeaflet(); } catch { el.innerHTML = `<a class="map-load" href="https://www.openstreetmap.org/?mlat=${OFFICE_LL[0]}&mlon=${OFFICE_LL[1]}#map=17/${OFFICE_LL[0]}/${OFFICE_LL[1]}" target="_blank" rel="noopener">OpenStreetMap</a>`; return; }
  if (!document.body.contains(el)) return;
  el.innerHTML = '';
  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([OFFICE_LL[0] + 0.0012, OFFICE_LL[1]], 16);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' }).addTo(map);
  const pin = L.divIcon({ className: 'soltura-pin', iconSize: [64, 84], iconAnchor: [32, 80], popupAnchor: [0, -76],
    html: `<span class="sp-pulse"></span><svg viewBox="0 0 64 84" aria-hidden="true"><path d="M32 82C32 82 6 52 6 31a26 26 0 0 1 52 0c0 21-26 51-26 51z" fill="#C63232" stroke="#fff" stroke-width="3"/><circle cx="32" cy="30" r="17" fill="#fff"/><circle cx="32" cy="22" r="6.5" fill="#FBCC10"/><path d="M20 39l12-11 12 11v3H20z" fill="#C63232"/></svg>` });
  L.marker(OFFICE_LL, { icon: pin, title: 'Grupo Soltura Real Estate' }).addTo(map)
    .bindPopup(`<b>Grupo Soltura Real Estate</b><br>Avda. de la Constitución s/n<br>03179 Formentera del Segura<br><a href="https://www.google.com/maps/dir/?api=1&destination=${OFFICE_LL.join(',')}" target="_blank" rel="noopener">${t('c_route')} →</a>`).openPopup();
  // scrollen over de pagina blijft scrollen; na een klik op de kaart mag je zoomen
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
}
// ---------- woonplaatsen: gids per plaats (core.town_guides via web_town_guides) — #/area en #/area/<slug> ----------
// Woningen horen bij een gids als hun plaats (of wijk) overeenkomt met de plaatsnaam of een alias van de gids.
const fold = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const TG = { list: {}, load: {} };
function townGuides() {
  const lang = S.lang;
  if (!TG.load[lang]) TG.load[lang] = api(`web_town_guides?select=slug,lang,town,aliases,title,lead,photos,coords,sort&lang=eq.${lang}&order=sort.asc`)
    .then(r => (TG.list[lang] = r)).catch(() => { delete TG.load[lang]; return []; });
  return TG.load[lang];
}
function guideKeys(g) { return [g.town, ...(g.aliases || [])].map(fold); }
// wijk weegt zwaarder dan plaats (Ciudad Quesada wint van Rojales); bij een wijknaam in twee gidsen wint de gids van dezelfde plaats
function guideFor(p, list) {
  if (!p || !list) return null;
  const town = fold(p.town), sub = fold(p.suburb);
  let best = null, top = 0;
  list.forEach(g => {
    const keys = guideKeys(g);
    const sc = (sub && keys.includes(sub) ? 2 : 0) + (town && keys.includes(town) ? 1 : 0);
    if (sc > top) { top = sc; best = g; }
  });
  return best;
}
// "In de buurt": de dichtstbijzijnde gidsen (hemelsbreed, uit coords) — zelfde als in de statische HTML (scripts/build.mjs)
function nearGuides(g, list, n = 4) {
  if (!g.coords || g.coords.length < 2) return [];
  const r = x => x * Math.PI / 180, km = (a, b) => 6371 * 2 * Math.asin(Math.sqrt(Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2));
  return (list || []).filter(x => x.slug !== g.slug && x.coords && x.coords.length >= 2).map(x => ({ g: x, km: km(g.coords, x.coords) })).sort((a, b) => a.km - b.km).slice(0, n);
}
function guideHomes(g) {
  const keys = guideKeys(g);
  return S.all.filter(p => p.image && (keys.includes(fold(p.town)) || (p.suburb && keys.includes(fold(p.suburb)))));
}
const tgImg = (ph, w) => ph && ph.url ? ph.url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${w}&quality=72&resize=contain` : '';
function tgCredit(ph) {
  return `${esc(ph.author || 'Wikimedia Commons')}, <a href="${esc(ph.page_url)}" target="_blank" rel="noopener nofollow">${esc(ph.license)}</a>`;
}
// hero met een langzaam bewegende foto (zelfde opbouw als Kopen/Verkopen, foto in plaats van video)
const AREA_HERO = 'https://wuvpbwowdycsdlrqkaoq.supabase.co/storage/v1/object/public/property-media/towns/guardamar-del-segura/1.jpg';
function areaHero(img, kicker, h, lead, acts) {
  return `<section class="page-hero short area-hero">${img ? `<img class="hero-kb" src="${esc(img)}" alt="" aria-hidden="true">` : ''}<div>${kicker}<h1>${h}</h1>${lead ? `<p>${lead}</p>` : ''}<p class="hero-acts">${acts}</p></div></section>`;
}
const waBtn = () => `<a class="btn wa" href="https://wa.me/34664414515" target="_blank" rel="noopener" data-track="whatsapp">WhatsApp</a>`;
async function pageArea(slug) {
  const main = $('#main');
  if (slug) return pageAreaDetail(slug);
  main.innerHTML = areaHero(tgImg({ url: AREA_HERO }, 1800), `<p class="kicker">${t('nav_areas')}</p>`, t('areas_h'), t('areas_p'), `<a class="btn lemon" href="${L('home')}">${t('see_all')}</a>${waBtn()}`)
    + `<div class="pg"><p class="pg-intro">${t('areas_intro')}</p><div class="area-grid" id="areaGrid">${'<div class="skeleton" style="height:260px;border-radius:14px"></div>'.repeat(6)}</div></div>${homesRail()}`;
  const list = await townGuides();
  if (currentPage !== 'area' || cur().key !== 'area') return;
  $('#areaGrid').innerHTML = list.map(g => {
    const n = guideHomes(g).length, ph = (g.photos || [])[0];
    return `<a class="area-card" href="${L('guide', g.slug)}">
      ${ph ? `<span class="ac-img"><img src="${esc(tgImg(ph, 640))}" alt="${esc(ph.alt || g.town)}" loading="lazy"></span>` : '<span class="ac-img"></span>'}
      <span class="ac-txt"><h3>${esc(g.town)}</h3><p>${esc(g.lead || '')}</p>${n ? `<small>${t('areas_n', n)}</small>` : ''}</span></a>`;
  }).join('') || `<p>${tx({ en: 'The guides could not load. Please try again shortly.', nl: 'De gidsen laden even niet. Probeer het zo opnieuw.', sv: 'Guiderna kunde inte laddas. Försök igen om en stund.' })}</p>`;
  observeCards(main);
}
async function pageAreaDetail(slug) {
  const main = $('#main');
  const back = `<p class="kicker"><a href="${L('area')}">← ${t('nav_areas')}</a></p>`;
  main.innerHTML = areaHero('', back, '&nbsp;', '', '') + `<div class="pg"><div class="skeleton" style="height:16em;border-radius:14px"></div></div>`;
  const g = await api(`web_town_guides?select=*&slug=eq.${encodeURIComponent(slug)}&lang=eq.${S.lang}&limit=1`).then(x => x[0]).catch(() => null);
  if (currentPage !== 'area' || cur().arg !== slug) return;
  if (!g) {
    main.innerHTML = `<div class="empty"><h2>${tx({ en: "We haven't written about this place yet", nl: 'Deze plaats hebben we (nog) niet beschreven', sv: 'Den här orten har vi inte skrivit om än' })}</h2><p><a class="btn primary" href="${L('area')}">${t('nav_areas')}</a></p></div>${homesRail()}`;
    observeCards(main); return;
  }
  document.title = `${g.title} · Grupo Soltura`;
  const secs = (g.sections || []).filter(s => s && (s.html || (s.rows && s.rows.length)));
  const photos = g.photos || [];
  const homes = guideHomes(g);
  const table = s => `<div class="tbl-wrap"><table class="area-tbl${s.key === 'festivals' ? ' fest' : ''}">${s.key === 'festivals'
      ? `<thead><tr><th>${tx({ en: 'Festival', nl: 'Feest', sv: 'Fest' })}</th><th>${tx({ en: 'When', nl: 'Wanneer', sv: 'När' })}</th><th>${tx({ en: 'What', nl: 'Wat', sv: 'Vad' })}</th></tr></thead>` : ''}<tbody>${s.rows.map(r => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="k"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  // eerste foto staat in de kop; de andere klein naast de tekst
  const fig = i => photos[i] ? `<figure class="area-fig" data-i="${i}"><img src="${esc(tgImg(photos[i], 900))}" alt="${esc(photos[i].alt || '')}" loading="lazy"><figcaption>${esc(photos[i].alt || '')} <span>· ${tgCredit(photos[i])}</span></figcaption></figure>` : '';
  const at = { 1: 1, 5: 2 };
  const homesBtn = homes.length ? `<button type="button" class="btn lemon" data-area-homes>${t('areas_btn', g.town)}</button>` : `<a class="btn lemon" href="${L('home')}">${t('see_all')}</a>`;
  main.innerHTML = areaHero(photos[0] ? tgImg(photos[0], 1800) : tgImg({ url: AREA_HERO }, 1800), back, esc(g.title), esc(g.lead || ''), homesBtn + waBtn())
    + `<div class="pg area-pg">
      ${(g.facts || []).length ? `<dl class="area-facts">${g.facts.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>` : ''}
      <div class="buy-grid area-grid2">
        <div class="area-main">
          <div class="post-body area-body">${secs.map((s, i) => `<section id="sec-${esc(s.key)}">${at[i] ? fig(at[i]) : ''}<h2 class="pg-h">${esc(s.heading)}</h2>${s.rows ? table(s) : sanitizeRich(s.html)}</section>`).join('')}</div>
          <details class="area-src"><summary>${tx({ en: 'Sources and photos', nl: 'Bronnen en foto\'s', sv: 'Källor och foton' })}</summary>
            <p class="muted">${tx({ en: 'We compile this guide carefully from public sources. Figures and dates can change; if in doubt, check with the town hall.', nl: 'Wij stellen deze gids met zorg samen uit openbare bronnen. Cijfers en data kunnen veranderen; check bij twijfel de gemeente.', sv: 'Vi sammanställer guiden noggrant utifrån offentliga källor. Siffror och datum kan ändras; kontrollera med kommunen om du är osäker.' })} ${tx({ en: 'Updated', nl: 'Bijgewerkt', sv: 'Uppdaterad' })} ${fmtDate(g.updated_at, true)}.</p>
            <ul>${(g.sources || []).filter(x => x && /^https?:/i.test(x.url || '')).map(x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener nofollow">${esc(x.title || new URL(x.url).hostname)}</a></li>`).join('')}</ul>
            ${photos.length ? `<p class="muted">${tx({ en: 'Photos via Wikimedia Commons', nl: 'Foto\'s via Wikimedia Commons', sv: 'Foton via Wikimedia Commons' })}: ${photos.map(tgCredit).join(' · ')}</p>` : ''}</details>
          <section class="area-near" id="areaNear" hidden></section>
        </div>
        <aside class="box side-cta area-side">
          <h2>${esc(g.town)}</h2>
          <nav class="area-toc" aria-label="${tx({ en: 'Topics', nl: 'Onderwerpen', sv: 'Ämnen' })}">${secs.map(s => `<a href="#sec-${esc(s.key)}" data-sec="${esc(s.key)}">${esc(s.heading)}</a>`).join('')}</nav>
          ${homes.length ? `<p>${t('areas_cta', g.town, homes.length)}</p>` : ''}
          ${homesBtn}
          <a class="btn ghost" href="${L('contact')}">${t('nav_contact')}</a>
        </aside>
      </div>
    </div>
    ${homes.length > 2 ? `<section class="section"><h2>${esc(t('area_h', g.town))}</h2><div class="rail">${homes.slice(0, 12).map(p => card(p)).join('')}</div></section>` : homesRail()}`;
  observeCards(main);
  $$('.area-toc a', main).forEach(a => a.addEventListener('click', e => { e.preventDefault(); const el = $('#sec-' + a.dataset.sec); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); track('area_toc', null, null, { slug: g.slug, sec: a.dataset.sec }); }));
  $$('.area-fig', main).forEach(f => f.addEventListener('click', e => { if (e.target.closest('a')) return; openLightbox(photos.map(ph => tgImg(ph, 1600)), +f.dataset.i, true); }));
  $$('[data-area-homes]', main).forEach(hb => hb.onclick = () => {
    const names = [...new Set(homes.map(p => p.town))];
    S.f = Object.assign(blankFilters(), { towns: names }); S.type = 'all'; S.shown = PAGE;
    track('area_homes', null, homes.length, { slug: g.slug });
    go(L('home'));
    setTimeout(() => { const b = $('#bar'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 600);
  });
  townGuides().then(list => {
    const near = nearGuides(g, list), box = $('#areaNear');
    if (!box || !near.length || cur().arg !== g.slug) return;
    box.innerHTML = `<h2 class="pg-h">${tx({ en: 'Nearby', nl: 'In de buurt', sv: 'I närheten' })}</h2><ul class="near-list">${near.map(x => `<li><a href="${L('guide', x.g.slug)}">${esc(x.g.town)}</a> <small>${Math.round(x.km)} km</small></li>`).join('')}</ul>`;
    box.hidden = false;
  });
  track('area_view', null, null, { slug: g.slug });
}
// in het woningpaneel: verwijzing naar de gids van de plaats
function areaLink(p) {
  townGuides().then(list => {
    const g = guideFor(p, list), box = $('#shArea');
    if (!box || S.openId !== p.id) return;
    if (!g) { box.innerHTML = ''; return; }
    const ph = (g.photos || [])[0];
    box.innerHTML = `<a class="area-link" href="${L('guide', g.slug)}" data-track="area_from_home">${ph ? `<img src="${esc(tgImg(ph, 240))}" alt="" loading="lazy">` : ''}<span><b>${esc(t('areas_link_h', g.town))}</b><small>${t('areas_link_p')}</small></span><i aria-hidden="true">→</i></a>`;
    $('a', box).addEventListener('click', () => track('area_from_home', p.id, null, { slug: g.slug }));
  });
}
function pageContact() {
  const fmtTel = tel => tel.replace(/(\+34)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  return `<section class="page-hero contact-hero"><img src="${OFFICE_IMG}" alt="${esc(t('c_office_alt'))}" fetchpriority="high"><div><p class="kicker">${t('nav_contact')}</p><h1>${t('contact_h')}</h1><p>${t('contact_p')}</p>
    <p class="hero-acts"><a class="btn wa" href="https://wa.me/34664414515" target="_blank" rel="noopener" data-track="whatsapp">${ICON.wa}WhatsApp</a><a class="btn lemon" href="#officeMap" data-scroll>${t('c_find')}</a></p></div></section>
  <div class="pg contact-grid">
    <div>
      <div class="ways">
        <a class="way wa" href="https://wa.me/34664414515" target="_blank" rel="noopener" data-track="whatsapp">${ICON.wa}<b>WhatsApp</b><span>${t('c_wa')}</span></a>
        <a class="way" href="tel:+34966792113" data-track="call">${ICON.phone}<b>+34 966 792 113</b><span>${t('c_call')}</span></a>
        <a class="way" href="mailto:info@gruposoltura.com">${ICON.mail}<b>info@gruposoltura.com</b><span>${t('c_mail')}</span></a>
      </div>
      <div class="map-card" id="officeMap">
        <div class="map" id="mapEl" role="region" aria-label="${esc(t('c_map'))}"><div class="map-load">${t('c_map')}</div></div>
        <div class="map-info"><h2>${t('office')}</h2><p>Grupo Soltura Real Estate<br>Avda. de la Constitución s/n<br>03179 Formentera del Segura, Alicante</p><p class="muted">${t('hours')}</p>
          <p class="map-acts"><a class="btn primary" href="https://www.google.com/maps/dir/?api=1&destination=${OFFICE_LL.join(',')}" target="_blank" rel="noopener" data-track="route">${t('c_route')}</a><a class="btn ghost" href="https://www.openstreetmap.org/?mlat=${OFFICE_LL[0]}&mlon=${OFFICE_LL[1]}#map=17/${OFFICE_LL[0]}/${OFFICE_LL[1]}" target="_blank" rel="noopener">OpenStreetMap</a></p></div>
      </div>
      <h2 class="pg-h">${t('c_team')}</h2>
      <div class="team-cards">${[2, 3, 4, 6].map(id => { const a = AGENTS[id]; return `<div class="tm"><div class="av">${a.short[0]}</div><div><b>${a.name}</b><span>${(a.role[S.lang] || a.role.en)}</span>
        <p><a href="https://wa.me/${a.tel.replace('+', '')}" target="_blank" rel="noopener" data-track="whatsapp">WhatsApp</a> · <a href="tel:${a.tel}" data-track="call">${fmtTel(a.tel)}</a></p></div></div>`; }).join('')}</div>
    </div>
    <div class="box form-card sticky"><h2>${t('c_form_h')}</h2>${richForm('contactForm', 'contact', [{ k: 'topic', label: t('f_topic'), opts: t('f_topic_opts') }, { k: 'preferred_language', label: t('f_lang'), opts: ['English', 'Nederlands', 'Deutsch', 'Français', 'Español'] }], '')}</div>
  </div>`;
}
function pagePrivacy() {
  const c = P('privacy');
  return `<div class="page-head"><p class="kicker">Grupo Soltura SL</p><h1>${c.h}</h1><p class="muted">${c.updated}</p></div>
    <div class="pg privacy">
      <nav class="toc">${c.sections.map(([h], i) => `<a href="#pv${i}" data-scroll>${h}</a>`).join('')}</nav>
      <div class="pv-body">${c.sections.map(([h, p], i) => `<section id="pv${i}"><h2>${h}</h2><p>${p}</p></section>`).join('')}
        <p><button class="btn ghost" type="button" data-cookie-settings>${c.change}</button></p></div>
    </div>`;
}
function pageFavs() {
  const items = [...S.favs].map(id => S.byId.get(id)).filter(Boolean);
  if (!items.length) return `<div class="empty"><h2>${t('fav_h')}</h2><p>${t('fav_empty')}</p><p><a class="btn primary" href="${L('home')}">${t('see_all')}</a></p></div>`;
  return `<div class="page-head"><h1>${t('fav_h')}</h1></div><section class="feed">${items.map(p => card(p)).join('')}</section>${homesRail()}${favMailPanel(items.length)}`;
}
// ---------- favorieten mailen (paneel "Stuur jezelf je favorieten") ----------
// web-contact (kind favorites) -> WebFormIntake-v2 -> JARVIS-Sales-FavoritesMail. Taal van de mail: opgeslagen taal als het
// e-mailadres bekend is, anders de browsertaal. Testmodus: /nl/favorieten/?test=1 (of oud #/favorites?test=1) -> mail alleen naar Rick, niets opgeslagen.
const favTest = () => new URLSearchParams(location.search).get('test') === '1';
const favMailOpen = () => { try { return sessionStorage.getItem('gs_favmail') !== 'closed' && !(matchMedia('(max-width:640px)').matches && sessionStorage.getItem('gs_favmail') !== 'open'); } catch { return true; } };
function favMailPanel(n) {
  const open = favMailOpen();
  const saved = ls.get('favmail', {});
  return `<aside class="favmail${open ? ' open' : ''}" id="favMail" aria-label="${esc(t('fm_title'))}">
    <button type="button" class="fm-pill" data-fm-toggle aria-expanded="${open}">${ICON.mail}<span>${esc(t('fm_pill', n))}</span></button>
    <div class="fm-card" role="region">
      <button type="button" class="fm-x" data-fm-toggle aria-label="${esc(t('fm_close'))}">×</button>
      <p class="fm-kicker">${ICON.heart}${esc(t('fm_kicker'))}</p>
      <h2>${esc(t('fm_title'))}</h2>
      <p class="fm-lead">${esc(t('fm_lead', n))}</p>
      ${favTest() ? `<p class="fm-test">${esc(t('fm_test'))}</p>` : ''}
      <form id="favMailForm" novalidate>
        <div class="fm-row">
          <label><span>${esc(t('fm_first'))}</span><input name="first" autocomplete="given-name" required maxlength="60" value="${esc(saved.first || '')}"></label>
          <label><span>${esc(t('fm_last'))}</span><input name="last" autocomplete="family-name" required maxlength="60" value="${esc(saved.last || '')}"></label>
        </div>
        <label><span>${esc(t('fm_email'))}</span><input name="email" type="email" inputmode="email" autocomplete="email" required maxlength="160" value="${esc(saved.email || '')}"></label>
        <input name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
        <button class="btn primary fm-send" type="submit">${ICON.mail}${esc(t('fm_send'))}</button>
        <p class="fm-out" aria-live="polite"></p>
        <p class="fm-note">${esc(t('fm_other'))} ${esc(t('fm_note'))} <a href="${L('privacy')}">${esc(t('privacy'))}</a></p>
      </form>
    </div>
  </aside>`;
}
function bindFavMail() {
  const box = $('#favMail'); if (!box) return;
  const sync = () => { const o = box.classList.contains('open'); $$('[data-fm-toggle]', box).forEach(b => b.setAttribute('aria-expanded', o)); document.body.classList.toggle('favmail-open', o); };
  $$('[data-fm-toggle]', box).forEach(b => b.addEventListener('click', () => {
    box.classList.toggle('open'); sync();
    try { sessionStorage.setItem('gs_favmail', box.classList.contains('open') ? 'open' : 'closed'); } catch {}
    if (box.classList.contains('open')) { const f = $('input[name=first]', box); if (f && !f.value) f.focus({ preventScroll: true }); track('fav_mail_open'); }
  }));
  sync();
  const form = $('#favMailForm', box);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const first = String(d.first || '').trim(), last = String(d.last || '').trim(), email = String(d.email || '').trim();
    const out = $('.fm-out', form);
    out.className = 'fm-out';
    if (!first || !last || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { out.classList.add('err'); out.textContent = t('fm_err'); return; }
    const refs = [...S.favs].map(id => S.byId.get(id)).filter(Boolean).map(p => p.reference).filter(Boolean).slice(0, 30);
    const btn = $('.fm-send', form); btn.disabled = true; btn.classList.add('busy');
    const test = favTest();
    const r = await fn('web-contact', { kind: 'favorites', ...formMeta('favMailForm', null, 'web-favorites-mail'), website: d.website || '',
      name: `${first} ${last}`, first, last, first_name: first, last_name: last, email, favorites: refs,
      browser_lang: (navigator.languages && navigator.languages[0]) || navigator.language || '', site_lang: S.lang, dry_run: test }).catch(() => ({ ok: false }));
    btn.disabled = false; btn.classList.remove('busy');
    if (r.ok) {
      out.classList.add('ok'); out.textContent = t('fm_ok', email);
      ls.set('favmail', { first, last, email });
      track('fav_mail', null, refs.length, { test });
    } else { out.classList.add('err'); out.textContent = r.error === 'rate' ? t('fm_rate') : r.error === 'contact' ? t('fm_err') : t('fm_fail'); }
  });
}
// link uit de favorietenmail: /en/favorites/?add=RH550,STU139 (oud: #/favorites?add=...) -> die woningen (weer) bewaren op dit apparaat
function importFavs() {
  if (!S.all.length) return;
  const q = new URLSearchParams(location.search); const add = (q.get('add') || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
  if (!add.length) return;
  let n = 0; add.forEach(ref => { const p = S.byRef.get(ref); if (p && !S.favs.has(p.id)) { S.favs.add(p.id); n++; } });
  if (n) { ls.set('favs', [...S.favs]); favCount(); }
  q.delete('add'); const rest = q.toString();
  history.replaceState(null, '', location.pathname + (rest ? '?' + rest : ''));
}
// ankerlinks binnen een pagina (#sectie)
addEventListener('click', e => { const a = e.target.closest('a[data-scroll]'); if (!a) return; e.preventDefault(); const el = document.getElementById(a.getAttribute('href').slice(1)); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

// ---------- router: echte paden (History API) ----------
// /en/... en /nl/... (js/routes.js). Een woning opent als sheet over de pagina eronder, maar heeft een eigen URL.
// Oude hash-links (#/home/RH550, #/area/rojales, #/favorites?add=...) uit mails en feeds worden bij binnenkomst omgezet.
let currentPage = null;
const cur = () => R.parse(location.pathname) || { lang: S.lang, key: 'notfound', arg: null };
// canonieke vorm van een route in een taal ('/' blijft '/': Engelse inhoud, canonical /en/)
function canon(r, lang = S.lang) {
  if (!r) return R.href(lang, 'home');
  if (r.key === 'home' && !r.lang && lang === 'en') return '/';
  if (r.key === 'property') { const p = S.byRef.get(r.arg); return R.href(lang, 'property', p || r.arg); }
  if (r.key === 'guide') return R.href(lang, 'guide', r.arg);
  if (r.key === 'news') return R.href(lang, 'news', r.arg);
  if (r.key === 'notfound') return location.pathname;
  return R.href(lang, r.key);
}
function go(path, o = {}) {
  const u = new URL(path, location.origin);
  if (u.origin !== location.origin) { location.assign(u.href); return; }
  const url = u.pathname + u.search + u.hash, nr = R.parse(u.pathname);
  if (o.replace) history.replaceState(null, '', url); else history.pushState(null, '', url);
  if (nr && nr.key === 'property') { if (!o.replace) S.sheetDepth = (S.sheetDepth || 0) + 1; } else S.sheetDepth = 0;
  route();
}
function setLang(l) {
  if (!R.LANGS.includes(l) || l === S.lang) return false;
  S.lang = l; ls.set('lang', l); applyLang(); return true;
}
function route() {
  const r = cur();
  consentMode();
  if (r.lang) setLang(r.lang);
  if (r.key === 'property') {
    const p = S.byRef.get(r.arg);
    if (p) { const c = ph(p); if (c !== location.pathname) history.replaceState(null, '', c + location.search); }
    // de pagina eronder (lijst of de pagina waar de woning vandaan werd geopend), in de taal van de woning
    const under = R.parse(S.lastRoute);
    if (under && under.key === 'news' && under.arg) under.arg = null;
    const lr = canon(under && under.key !== 'property' ? under : { key: 'home', lang: S.lang });
    if (!currentPage || S.renderedLang !== S.lang || S.lastRoute !== lr) { S.lastRoute = lr; renderPage(R.parse(lr) || { key: 'home' }); }
    if (S.all.length) openSheet(r.arg);
    return;
  }
  if (!$('#sheet').hidden) { closeSheetTracking(); $('#sheet').hidden = true; document.body.style.overflow = ''; }
  if (r.key !== 'notfound') { const c = canon(r); if (c !== location.pathname) history.replaceState(null, '', c + location.search + location.hash); }
  const path = location.pathname;
  // terug van een woning naar dezelfde pagina: niet opnieuw opbouwen (filters en scrollpositie blijven)
  if (currentPage && S.lastRoute === path && S.renderedLang === S.lang && S.renderedSearch === location.search) { setTitle(); return; }
  S.lastRoute = path;
  renderPage(r);
}
function setTitle() { if (S.pageTitle) document.title = S.pageTitle; }
function renderPage(r) {
  r = r || { key: 'home' };
  const key = r.key === 'guide' ? 'area' : r.key;
  currentPage = key; S.renderedLang = S.lang; S.renderedSearch = location.search;
  $$('.nav a').forEach(a => { if (a.dataset.route === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  navLinks();
  $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  const main = $('#main');
  window.scrollTo(0, 0);
  switch (key) {
    case 'buy': main.innerHTML = pageBuy(); bindMortgage(null); bindForm($('#buyForm')); break;
    case 'sell': main.innerHTML = pageSell(); bindForm($('#sellForm')); break;
    case 'move': main.innerHTML = pageMove(); bindForm($('#moveForm')); break;
    case 'news': pageNews(r.arg || ''); break;
    case 'area': pageArea(r.key === 'guide' ? r.arg : ''); break;
    case 'contact': main.innerHTML = pageContact(); bindForm($('#contactForm')); if ('IntersectionObserver' in window) { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); initMap(); } }, { rootMargin: '300px' }); o.observe($('#mapEl')); } else initMap(); break;
    case 'privacy': main.innerHTML = pagePrivacy(); break;
    case 'favorites': importFavs(); main.innerHTML = pageFavs(); bindFavMail(); break;
    case 'notfound': main.innerHTML = `<div class="empty"><h2>${tx({ en: 'This page does not exist', nl: 'Deze pagina bestaat niet (meer)', sv: 'Den här sidan finns inte' })}</h2><p><a class="btn primary" href="${L('home')}">${t('see_all')}</a> <a class="btn ghost" href="${L('area')}">${t('nav_areas')}</a></p></div>`; break;
    default: currentPage = 'home'; renderHome();
  }
  if (key !== 'favorites') document.body.classList.remove('favmail-open');
  observeCards(main);
  $$('[data-track]', main).forEach(a => a.addEventListener('click', () => track(a.dataset.track, null, null, { from: key })));
  renderFooterStack();
  if (key !== 'home') hidePop();
  const names = { buy: 'nav_buy', sell: 'nav_sell', move: 'nav_move', area: 'nav_areas', news: 'nav_news', contact: 'nav_contact', favorites: 'fav_h', privacy: 'privacy' };
  if (!((key === 'area' || key === 'news') && r.arg)) { S.pageTitle = key === 'home' || !names[key] ? 'Grupo Soltura · ' + t('hero_title') : `${t(names[key])} · Grupo Soltura`; document.title = S.pageTitle; }
  track('page', null, null, { p: key });
}
// vaste links in kop en voet in de taal van de pagina
function navLinks() {
  $$('[data-route]').forEach(a => { a.href = L(a.dataset.route); });
  $$('[data-href]').forEach(a => { a.href = L(a.dataset.href); });
  $$('[data-guide]').forEach(a => { a.href = L('guide', a.dataset.guide); });
}
// interne links: zonder herladen navigeren (nieuwe tab, ctrl/cmd-klik en externe links blijven gewoon werken)
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]');
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-scroll') || a.hasAttribute('data-cookie-settings')) return;
  const href = a.getAttribute('href');
  if (href.startsWith('#/')) { e.preventDefault(); go(R.fromHash(href, S.lang)); return; }
  if (href.charAt(0) === '#') return;
  let u; try { u = new URL(a.href); } catch { return; }
  if (u.origin !== location.origin || !R.parse(u.pathname)) return;
  e.preventDefault();
  if (u.pathname + u.search === location.pathname + location.search && $('#sheet').hidden) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  go(u.pathname + u.search + u.hash);
});
addEventListener('popstate', () => {
  const r = cur();
  if (r.key !== 'property') S.sheetDepth = 0; else if (S.sheetDepth > 0) S.sheetDepth--;
  route();
});
// een oude hash-link in de adresbalk of op de pagina (bv. #/home/RH550): omzetten naar het echte pad
addEventListener('hashchange', () => { if (location.hash.startsWith('#/')) go(legacyUrl(), { replace: true }); });
function legacyUrl() {
  const qp = new URLSearchParams(location.search);
  const lang = R.LANGS.includes(qp.get('lang')) ? qp.get('lang') : S.lang;
  qp.delete('lang');
  const target = R.fromHash(location.hash, lang); // pad (+ eventuele ?add=... uit de hash)
  const u = new URL(target, location.origin);
  qp.forEach((v, k) => { if (!u.searchParams.has(k)) u.searchParams.set(k, v); });
  return u.pathname + u.search;
}

// ---------- language, menu ----------
function applyLang() {
  document.documentElement.lang = S.lang;
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === S.lang));
  navLinks();
}
// taalwissel = naar de tegenhanger van deze pagina in de andere taal
async function switchLang(to) {
  const r = cur();
  if (r.key === 'news' && r.arg) {
    let path = R.href(to, 'news');
    try {
      const p = (await api(`web_blog_posts?select=group_id,lang&slug=eq.${encodeURIComponent(r.arg)}&limit=1`))[0];
      if (p && p.lang === to) path = R.href(to, 'news', r.arg);
      else if (p && p.group_id) { const sib = (await api(`web_blog_posts?select=slug&group_id=eq.${encodeURIComponent(p.group_id)}&lang=eq.${to}&limit=1`))[0]; if (sib) path = R.href(to, 'news', sib.slug); }
    } catch {}
    return go(path);
  }
  if (r.key === 'property') return go(R.href(to, 'property', S.byRef.get(r.arg) || r.arg), { replace: true });
  go(canon(r.key === 'home' ? { key: 'home', lang: to } : r, to) + (r.key === 'favorites' ? location.search : ''));
}
$$('.lang button').forEach(b => b.addEventListener('click', () => { if (S.lang !== b.dataset.lang) switchLang(b.dataset.lang); }));
$('#menuBtn').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', o); });
$('#waFloat').addEventListener('click', () => track('whatsapp'));
$$('.top [data-track]').forEach(a => a.addEventListener('click', () => track(a.dataset.track, null, null, { from: 'header' })));
// header: hoogte doorgeven aan de sticky filterbalk en compact maken bij scrollen
(() => {
  const top = $('#top');
  const setH = () => document.documentElement.style.setProperty('--top-h', top.offsetHeight + 'px');
  if ('ResizeObserver' in window) new ResizeObserver(setH).observe(top); else setH();
  // Hysterese: compact vanaf 100px, pas weer groot onder 16px. Het compact maken haalt ~40px hoogte weg,
  // waardoor scrollY terugspringt; met één drempel (40) gaf dat een lus en trilde het logo.
  let compact = false;
  addEventListener('scroll', () => { const y = scrollY; const c = compact ? y > 16 : y > 100; if (c !== compact) { compact = c; top.classList.toggle('compact', c); } }, { passive: true });
})();

// ---------- boot ----------
async function boot() {
  // oude links: #/... -> echt pad; ?lang= op de startpagina -> /nl/ of /en/
  const qp = new URLSearchParams(location.search);
  if (location.hash.startsWith('#/')) history.replaceState(null, '', legacyUrl());
  else if (location.pathname === '/' || location.pathname === '/index.html') {
    const want = R.LANGS.includes(qp.get('lang')) ? qp.get('lang') : S.lang;
    qp.delete('lang'); const q = qp.toString() ? '?' + qp.toString() : '';
    // '/' toont Engels (canonical /en/); wie Nederlands/Zweeds koos of zo'n browser heeft, gaat naar /nl/ of /sv/
    if (want === 'nl' || want === 'sv') history.replaceState(null, '', '/' + want + '/' + q + location.hash);
    else { S.lang = 'en'; if (location.search !== q) history.replaceState(null, '', '/' + q + location.hash); }
  }
  const r0 = R.parse(location.pathname);
  if (r0 && r0.lang) S.lang = r0.lang;
  ls.set('lang', S.lang);
  applyLang(); favCount();
  consentBar();
  // installeerbaar als app (PWA): service worker voor snelle herstart en een offline-melding
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
  route();
  api('web_config?select=key,value').then(rows => rows.forEach(r => { S.cfg[r.key] = Number(r.value); })).catch(() => {});
  try {
    S.all = await api(`web_properties?select=${LIST_COLS}`);
  } catch (e) {
    $('#main').insertAdjacentHTML('afterbegin', `<div class="empty"><h2>${tx({ en: 'Listings could not load', nl: 'Het aanbod laadt even niet', sv: 'Utbudet kunde inte laddas' })}</h2><p>${tx({ en: 'Refresh the page, or call us on +34 966 792 113.', nl: 'Ververs de pagina, of bel ons op +34 966 792 113.', sv: 'Ladda om sidan eller ring oss på +34 966 792 113.' })}</p></div>`);
    return;
  }
  S.all.forEach(p => { S.byRef.set(String(p.reference).toUpperCase(), p); S.byId.set(p.id, p); if (p.wp_id) S.byWp.set(Number(p.wp_id), p); });
  // keep only favourites/viewed that still exist
  // bewaarde/bekeken woningen van vóór 18-10 staan op WP-id: omzetten naar de core-uuid; verdwenen woningen vallen weg
  const toId = x => typeof x === 'number' || /^\d+$/.test(String(x)) ? (S.byWp.get(Number(x)) || {}).id : (S.byId.has(x) ? x : null);
  S.favs = new Set([...S.favs].map(toId).filter(Boolean)); ls.set('favs', [...S.favs]); favCount();
  S.viewed = [...new Set(S.viewed.map(toId).filter(Boolean))]; ls.set('viewed', S.viewed);
  if (currentPage === 'home') { countUp(); renderBar(); renderFeed(); }
  else renderPage(R.parse(S.lastRoute));
  const r = cur();
  // woning-URL: nu de data er is, de sheet openen (bestaat de woning niet meer, dan toont de sheet dat met een link naar het aanbod)
  if (r.key === 'property') route();
}
boot();
})();
