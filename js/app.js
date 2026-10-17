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
  2: { name: 'Rick van Hoeven', short: 'Rick', tel: '+34664414515', role: { en: 'Owner & director', nl: 'Eigenaar & directeur' } },
  3: { name: 'Marco Verschoor', short: 'Marco', tel: '+34670687341', role: { en: 'Partner, sales', nl: 'Partner, verkoop' } },
  4: { name: 'Ingrid van Hoeven', short: 'Ingrid', tel: '+34664414668', role: { en: 'Administration & sales support', nl: 'Administratie & verkoopondersteuning' } },
  6: { name: 'Lisette Don', short: 'Lisette', tel: '+34662226338', role: { en: 'After-sales & client care', nl: 'Nazorg & klantbegeleiding' } },
};
const OFFICE = 2;
const PAGE = 24;
const CAT_NL = { villa: 'Villa', apartment: 'Appartement', bungalow: 'Bungalow', detached: 'Vrijstaand huis', townhouse: 'Rijtjeshuis', penthouse: 'Penthouse', quadrant: 'Hoekwoning (quad)', duplex: 'Duplex', finca: 'Finca', 'semi-detached': 'Twee-onder-een-kap', commercial: 'Bedrijfspand', other: 'Woning', plot: 'Bouwgrond', attic: 'Penthouse' };
const CAT_EN = { quadrant: 'Quad house', 'semi-detached': 'Semi-detached', attic: 'Penthouse', other: 'Home' };
const LIST_COLS = 'wp_id,reference,category,is_newbuild,town,suburb,price,price_from,previous_price,price_changedate,bedrooms,bathrooms,build_area,plot_area,pool_private,pool_communal,dist_sea_m,label_exclusive,featured,under_offer,list_date,image,media_ids,market_deviation_pct,popularity,agent_wp_id';

// ---------- state ----------
const ls = {
  get(k, d) { try { const v = localStorage.getItem('gs_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gs_' + k, JSON.stringify(v)); } catch {} },
};
const S = {
  lang: ls.get('lang', (navigator.language || 'en').toLowerCase().startsWith('nl') ? 'nl' : 'en'),
  all: [], byRef: new Map(), byId: new Map(),
  f: blankFilters(), sort: 'foryou', type: 'all',
  shown: PAGE, order: [],
  favs: new Set(ls.get('favs', [])),
  viewed: ls.get('viewed', []), // [wp_id] newest first
  media: new Map(),
  cfg: { itp_resale_pct: 9, iva_newbuild_pct: 10, ajd_newbuild_pct: 1.5, buyer_all_in_eur: 0 },
  vid: ls.get('vid', null) || rid(), sid: rid(),
  lastRoute: '#/', openSince: 0, openId: null,
};
ls.set('vid', S.vid);
function blankFilters() { return { towns: [], categories: [], price_min: null, price_max: null, beds_min: null, baths_min: null, pool: null, newbuild: null, max_sea_km: null, reduced_only: false }; }
function rid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const t = (k, ...a) => { const v = (I18N[S.lang] || I18N.en)[k] ?? I18N.en[k]; return typeof v === 'function' ? v(...a) : v; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = n => n == null ? '' : new Intl.NumberFormat(S.lang === 'nl' ? 'nl-NL' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const num = n => new Intl.NumberFormat(S.lang === 'nl' ? 'nl-NL' : 'en-GB').format(n);
const dist = m => m == null || m === 7000 ? null : (m >= 1000 ? (Math.round(m / 100) / 10).toString().replace('.', S.lang === 'nl' ? ',' : '.') + ' km' : Math.round(m) + ' m');
const catName = c => S.lang === 'nl' ? (CAT_NL[c] || cap(c)) : (CAT_EN[c] || cap(c));
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const title = p => `${catName(p.category)} ${S.lang === 'nl' ? 'in' : 'in'} ${p.suburb && p.suburb !== p.town ? p.suburb + ', ' : ''}${p.town || ''}`;
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
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg>',
  calc: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12v5M8 16h2M12 16h2"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  hand: '<svg viewBox="0 0 24 24"><path d="M9 11V5a1.5 1.5 0 0 1 3 0v5M12 10V4a1.5 1.5 0 0 1 3 0v6M15 10V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L9 13"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
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
function track(event, wp_id = null, value = null, meta = null) {
  try {
    fetch(SB + '/rest/v1/web_events', {
      method: 'POST', keepalive: true,
      headers: { apikey: KEY, 'content-type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ sid: S.sid, vid: S.vid, lang: S.lang, event, wp_id, value, meta }),
    });
  } catch {}
}
function sanitize(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,noscript,template').forEach(n => n.remove());
  const ok = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'BR', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4']);
  const walk = n => {
    [...n.children].forEach(c => {
      walk(c);
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
  if (p.under_offer) s -= 3;
  if (!p.image) s -= 10;
  if (pr) {
    s += 4 * (pr.towns[p.town] || 0) / pr.n + 4 * (pr.cats[p.category] || 0) / pr.n;
    if (pr.median && p.price) s += 3 * Math.max(0, 1 - Math.abs(p.price - pr.median) / pr.median);
  }
  return s;
}

// ---------- filtering ----------
function match(p, f = S.f, type = S.type) {
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
  const by = {
    foryou: (a, b) => score(b, pr) - score(a, pr),
    newest: (a, b) => new Date(b.list_date || 0) - new Date(a.list_date || 0),
    price_asc: (a, b) => (a.price || 9e9) - (b.price || 9e9),
    price_desc: (a, b) => (b.price || 0) - (a.price || 0),
    value: (a, b) => (a.is_newbuild || a.market_deviation_pct == null ? 99 : a.market_deviation_pct) - (b.is_newbuild || b.market_deviation_pct == null ? 99 : b.market_deviation_pct),
    reduced: (a, b) => (dropPct(b) - dropPct(a)) || (new Date(b.price_changedate || 0) - new Date(a.price_changedate || 0)),
  }[S.sort] || (() => 0);
  list.sort(by);
  S.order = list;
  return list;
}

// ---------- card ----------
function badges(p) {
  const b = [];
  if (p.under_offer) b.push(`<span class="badge offer">${t('under_offer')}</span>`);
  if (reduced(p)) b.push(`<span class="badge drop">${t('reduced')} −${dropPct(p)}%</span>`);
  if (belowMkt(p)) b.push(`<span class="badge value">${t('below_market', belowMkt(p))}</span>`);
  if (p.is_newbuild) b.push(`<span class="badge new">${t('new_badge')}</span>`);
  if (p.label_exclusive) b.push(`<span class="badge">${t('exclusive')}</span>`);
  return b.slice(0, 2).join('');
}
function priceHtml(p) {
  if (p.price == null) return `<div class="price">${S.lang === 'nl' ? 'Prijs op aanvraag' : 'Price on request'}</div>`;
  return `<div class="price">${p.price_from ? `<small>${t('from')}</small>` : ''}${eur(p.price)}${reduced(p) ? `<s>${eur(p.previous_price)}</s>` : ''}</div>`;
}
function specs(p) {
  const s = [];
  if (p.bedrooms) s.push(`<span title="${t('beds')}">${ICON.bed}${p.bedrooms}</span>`);
  if (p.bathrooms) s.push(`<span title="${t('baths')}">${ICON.bath}${p.bathrooms}</span>`);
  if (p.build_area) s.push(`<span title="${t('built')}">${ICON.area}${num(p.build_area)} m²</span>`);
  if (p.plot_area) s.push(`<span title="${t('plot')}">${num(p.plot_area)} m² ${S.lang === 'nl' ? 'perceel' : 'plot'}</span>`);
  if (p.pool_private) s.push(`<span class="pool own" title="${t('pool_private')}">${ICON.pool}${t('pool_short_private')}</span>`);
  else if (p.pool_communal) s.push(`<span class="pool shared" title="${t('pool_communal')}">${ICON.pool}${t('pool_short_communal')}</span>`);
  return `<div class="specs">${s.join('')}</div>`;
}
function card(p, opts = {}) {
  const fav = S.favs.has(p.wp_id);
  const n = Math.min((p.media_ids || []).length, 8);
  return `<a class="card" href="#/home/${encodeURIComponent(p.reference)}" data-id="${p.wp_id}">
    <div class="ph">
      ${p.image ? `<img class="kb" src="${esc(p.image)}" alt="${esc(title(p))}" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async">` : ''}
      <div class="badges">${badges(p)}</div>
      <button class="heart" type="button" aria-pressed="${fav}" aria-label="${S.lang === 'nl' ? 'Bewaren' : 'Save'}" data-fav="${p.wp_id}">${ICON.heart}</button>
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
  toggleFav(Number(h.dataset.fav));
});
function toggleFav(id) {
  if (S.favs.has(id)) S.favs.delete(id); else { S.favs.add(id); track('fav', id); }
  ls.set('favs', [...S.favs]);
  $$(`[data-fav="${id}"]`).forEach(b => b.setAttribute('aria-pressed', S.favs.has(id)));
  favCount();
}
function favCount() { $('#favCount').textContent = S.favs.size; $('.fav-link').classList.toggle('has', S.favs.size > 0); }

async function mediaFor(p) {
  if (S.media.has(p.wp_id)) return S.media.get(p.wp_id);
  const ids = (p.media_ids || []).slice(0, 40);
  let urls = [];
  if (ids.length) {
    try {
      const rows = await api(`web_media_cache?select=media_id,url&media_id=in.(${ids.join(',')})`);
      const m = new Map(rows.map(r => [Number(r.media_id), r.url]));
      urls = ids.map(i => m.get(i)).filter(Boolean);
    } catch {}
  }
  if (!urls.length && p.image) urls = [p.image];
  else if (p.image && !urls.includes(p.image)) urls.unshift(p.image);
  S.media.set(p.wp_id, urls);
  return urls;
}
let scrubTimer = null;
document.addEventListener('pointerover', async e => {
  const c = e.target.closest('.card .ph'); if (!c || e.pointerType !== 'mouse') return;
  const card = c.closest('.card'); if (card.dataset.scrub) return;
  card.dataset.scrub = '1';
  const p = S.byId.get(Number(card.dataset.id)); if (!p) return;
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
      const r = await fn('web-contact', { kind: 'newsletter', lang: S.lang, name: `${fd.get('first') || ''} ${fd.get('last') || ''}`.trim(), email, interests, website: fd.get('website'), vid: S.vid }).catch(() => ({ ok: false }));
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
  if (popShown || ls.get('nl_done', 0) || Date.now() - ls.get('nl_dismissed', 0) < 7 * 864e5) return;
  if (!$('#sheet').hidden || !$('#reel').hidden) return;
  const depth = (scrollY + innerHeight) / document.documentElement.scrollHeight;
  if (currentPage === 'home' ? (S.rendered >= 18 && depth > .45) : depth > .7) {
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
      <div class="ai-badge"><i></i>${ICON.spark}<span>${t('ai_badge')}</span></div>
      <form class="ask" id="askForm" role="search">
        <input id="askInput" type="search" autocomplete="off" placeholder="${esc(t('ask_ph'))}" aria-label="${esc(t('ask_ph'))}">
        <button type="submit" id="askBtn">${t('ask_btn')}</button>
      </form>
      <div class="chips">${t('chips').map(c => `<button type="button" class="chip">${esc(c)}</button>`).join('')}</div>
      <p class="ai-reply" id="aiReply" aria-live="polite"></p>
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
  $('#askForm').addEventListener('submit', e => { e.preventDefault(); aiSearch($('#askInput').value); });
  $$('.chip').forEach(c => c.addEventListener('click', () => { $('#askInput').value = c.textContent; aiSearch(c.textContent); }));
  $$('#hints [data-hint]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.hint; track('hint', null, null, { k });
    if (k === 'search') { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => $('#askInput').focus(), 350); }
    else if (k === 'reel') openReel(0);
    else if (k === 'fav') location.hash = '#/favorites';
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
  if (f.towns.length) pill(f.towns.join(', '), 'towns');
  if (f.categories.length) pill(f.categories.map(catName).join(', '), 'categories');
  if (f.price_min || f.price_max) pill(`${f.price_min ? eur(f.price_min) : '€0'} – ${f.price_max ? eur(f.price_max) : '…'}`, 'price');
  if (f.beds_min) pill(`${f.beds_min}+ ${t('beds')}`, 'beds_min');
  if (f.baths_min) pill(`${f.baths_min}+ ${t('baths')}`, 'baths_min');
  if (f.pool) pill(f.pool === 'communal' ? t('pool_communal') : t('pool_private'), 'pool');
  if (f.max_sea_km) pill(`≤ ${f.max_sea_km} km ${S.lang === 'nl' ? 'tot zee' : 'to the sea'}`, 'max_sea_km');
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
  const feed = $('#feed'); if (!feed) return;
  if (!S.all.length) { feed.innerHTML = Array.from({ length: 6 }, () => '<div><div class="ph skeleton" style="aspect-ratio:4/3;border-radius:14px"></div></div>').join(''); return; }
  const list = append ? S.order : computeOrder();
  $('#resultN').textContent = t('results', list.length);
  if (!list.length) {
    feed.innerHTML = `<div class="empty" style="grid-column:1/-1"><h2>${S.lang === 'nl' ? 'Niets gevonden met deze wensen' : 'Nothing matches all of these wishes'}</h2><p>${S.lang === 'nl' ? 'Haal een filter weg, of stuur ons je wensen: veel woningen komen eerst naar onze eigen zoekers.' : 'Remove a filter, or send us your wishes: many homes reach our own searchers first.'}</p><p><a class="btn primary" href="#/contact">${t('nav_contact')}</a></p></div>`;
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
  const shownIds = new Set(S.order.slice(0, S.shown).map(p => p.wp_id));
  const pick = (fnSort, filt, n = 10) => S.all.filter(p => p.image && filt(p) && match(p, blankFilters())).sort(fnSort).slice(0, n);
  const rail = (h, p, items) => items.length < 3 ? '' : `<div class="moment"><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}<div class="rail">${items.map(x => card(x)).join('')}</div></div>`;
  if (pos === 6) {
    if (pr) return rail(t('m_foryou_h'), t('m_foryou_p'), pick((a, b) => score(b, pr) - score(a, pr), p => !S.viewed.includes(p.wp_id) && !shownIds.has(p.wp_id)));
    return rail(t('m_drops_h'), t('m_drops_p'), pick((a, b) => new Date(b.price_changedate || 0) - new Date(a.price_changedate || 0), reduced));
  }
  if (pos === 15) return `<div class="story">${video(VIDEO.village)}<div><h2>${t('story_move_h')}</h2><p>${t('story_move_p')}</p><a class="btn lemon" href="#/move">${t('story_move_btn')}</a></div></div>`;
  if (pos === 24) return rail(t('m_value_h'), t('m_value_p'), pick((a, b) => a.market_deviation_pct - b.market_deviation_pct, p => belowMkt(p) > 0));
  if (pos === 30 && !ls.get('nl_done', 0)) return `<div class="moment">${newsletterHtml('inline')}</div>`;
  if (pos === 36 && S.viewed.length >= 3) return rail(t('m_recent_h'), '', S.viewed.slice(0, 12).map(id => S.byId.get(id)).filter(Boolean));
  if (pos === 48) return `<div class="story">${video(VIDEO.villa)}<div><h2>${t('story_sell_h')}</h2><p>${t('story_sell_p')}</p><a class="btn lemon" href="#/sell">${t('story_sell_btn')}</a></div></div>`;
  return '';
}

async function aiSearch(q) {
  q = (q || '').trim(); if (!q) return;
  const btn = $('#askBtn'), out = $('#aiReply');
  btn.disabled = true; btn.textContent = t('asking'); out.textContent = '';
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
  out.textContent = r.reply || '';
  renderBar(); renderFeed();
  $('#bar').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- PROPERTY SHEET ----------
async function openSheet(ref) {
  const p = S.byRef.get(ref.toUpperCase());
  const sh = $('#sheet'), inner = $('#sheetInner');
  if (!p) { inner.innerHTML = `<div class="empty"><h2>${S.lang === 'nl' ? 'Deze woning is niet meer beschikbaar' : 'This home is no longer available'}</h2><p><a class="btn primary" href="#/">${t('see_all')}</a></p></div>`; sh.hidden = false; return; }
  closeSheetTracking();
  S.openId = p.wp_id; S.openSince = Date.now();
  S.viewed = [p.wp_id, ...S.viewed.filter(x => x !== p.wp_id)].slice(0, 60); ls.set('viewed', S.viewed);
  track('view_property', p.wp_id);
  document.body.style.overflow = 'hidden';
  sh.hidden = false;
  const ag = agentOf(p);
  const waHref = `https://wa.me/${ag.tel.replace('+', '')}?text=${encodeURIComponent(t('wa_text', p.reference))}`;
  inner.innerHTML = `
    <div class="sh-top">
      <button class="icon-btn" type="button" data-close aria-label="${t('close')}">${ICON.x}</button>
      <span class="ref">${t('sh_ref')} ${esc(p.reference)}</span><span class="grow"></span>
      <button class="icon-btn" type="button" id="shShare" aria-label="${t('share')}">${ICON.share}</button>
      <button class="heart" style="position:static;border:1px solid var(--mist)" type="button" aria-pressed="${S.favs.has(p.wp_id)}" data-fav="${p.wp_id}" aria-label="Save">${ICON.heart}</button>
      <button class="icon-btn" type="button" data-step="-1" aria-label="${t('prev_home')}">${ICON.l}</button>
      <button class="icon-btn" type="button" data-step="1" aria-label="${t('next_home')}">${ICON.r}</button>
    </div>
    <div class="gal" id="gal"><div class="gal-track" id="galTrack">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}</div>
      <button class="nav-g prev" type="button" aria-label="Previous photo">${ICON.l}</button><button class="nav-g next" type="button" aria-label="Next photo">${ICON.r}</button><span class="count" id="galCount"></span><span class="ref-tag gal-ref">${esc(p.reference)}</span></div>
    <div class="thumbs" id="thumbs"></div>
    <div class="sh-body">
      <div>
        <div class="badges" style="display:flex;gap:6px">${badges(p)}</div>
        <h1 id="sheetTitle">${esc(title(p))}</h1>
        <div class="sh-price">${p.price_from ? `<small style="font-size:16px;font-weight:500">${t('from')}</small>` : ''}${p.price != null ? eur(p.price) : ''}${reduced(p) ? `<s>${eur(p.previous_price)}</s>` : ''}</div>
        <div class="quick-acts">
          <button type="button" data-go="chatBox">${ICON.chat}<span>${t('qa_ask')}</span></button>
          <button type="button" data-go="mortBox">${ICON.calc}<span>${t('qa_mort')}</span></button>
          <button type="button" data-go="gal">${ICON.cam}<span id="qaPhotos">${t('qa_photos', (p.media_ids || []).length || 1)}</span></button>
          <button type="button" data-go="viewBtn">${ICON.cal}<span>${t('qa_view')}</span></button>
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
          <a class="btn wa" href="${waHref}" target="_blank" rel="noopener" data-track="whatsapp">${t('wa_btn')}</a>
          <a class="btn ghost" href="tel:${ag.tel}" data-track="call">${t('call_btn')} ${ag.tel.replace(/(\+34)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}</a>
          <button class="btn primary" type="button" id="viewBtn">${t('viewing_btn')}</button>
          <form class="form" id="viewForm" hidden style="margin-top:12px">${contactFields('viewing', p)}</form>
        </div>
        <div id="costBox"></div>
      </aside>
    </div>
    <button class="chat-fab" type="button" id="chatFab">${t('ask_fab')}</button>
    <div class="sh-more" id="shMore"></div>
    <div class="sh-next"><button class="btn ghost" type="button" data-step="-1">← ${t('prev_home')}</button><button class="btn primary" type="button" data-step="1">${t('next_home')} →</button></div>`;
  inner.scrollTop = 0;
  bindSheet(p, waHref);
  fillFacts(p);
  renderMore(p);
  // details + gallery in parallel
  const [full, urls, geo] = await Promise.all([
    api(`web_properties?select=*&wp_id=eq.${p.wp_id}`).then(r => r[0]).catch(() => null),
    mediaFor(p),
    api(`web_property_geo?select=*&wp_id=eq.${p.wp_id}`).then(r => r[0]).catch(() => null),
  ]);
  if (S.openId !== p.wp_id) return;
  gallery(urls);
  if ($('#qaPhotos')) $('#qaPhotos').textContent = t('qa_photos', urls.length);
  if (geo && geo.beach_km != null) {
    const km = v => String(Math.round(v)).replace('.', ',') + ' km';
    $('#keyfacts').insertAdjacentHTML('afterbegin', `<div><b>${km(geo.beach_road_km || geo.beach_km)}</b><span>${t('sh_sea')} · ${geo.beach_drive_min} min</span></div><div><b>${km(geo.alc_km * 1.25)}</b><span>${t('sh_airport')} ALC · ${geo.alc_drive_min} min</span></div>`);
  }
  if (full) fillDetail(full);
}
// ---------- hypotheekcalculator (annuïteit) ----------
function mortgageHtml(p) {
  const rate = S.cfg.mortgage_rate_pct || 3.13;
  return `<div class="box mort" id="mortBox"><h3>${t('mort_h')}</h3><p class="mhint">${ICON.hand}${t('mort_hint')}</p>
    <label class="mrow"><span>${t('mort_amount')}</span><span class="eurin"><b>€</b><input id="mAmt" inputmode="numeric" value="${num(250000)}" aria-label="${t('mort_amount')}"></span></label>
    ${p && p.price ? `<div class="mquick"><button type="button" data-ltv="60">60% ${t('mort_of_price')}</button><button type="button" data-ltv="70">70%</button><button type="button" data-ltv="80">80%</button></div>` : ''}
    <label class="mrow"><span>${t('mort_term')}</span><b id="mTermV">25 ${t('mort_years')}</b></label>
    <input type="range" id="mTerm" min="5" max="30" step="1" value="25" aria-label="${t('mort_term')}">
    <label class="mrow"><span>${t('mort_rate')}</span><span class="pctin"><input id="mRate" inputmode="decimal" value="${String(rate).replace('.', S.lang === 'nl' ? ',' : '.')}" aria-label="${t('mort_rate')}"><b>%</b></span></label>
    <div class="mout"><span>${t('mort_monthly')}</span><strong id="mPay">–</strong></div>
    <div class="mmeta"><span>${t('mort_interest')} <b id="mInt">–</b></span><span>${t('mort_total')} <b id="mTot">–</b></span></div>
    <p class="mnote">${t('mort_note', String(rate).replace('.', S.lang === 'nl' ? ',' : '.'))}</p></div>`;
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
  const onInput = () => { calc(); if (!tracked) { tracked = true; track('mortgage', p && p.wp_id); } };
  $('#mAmt').addEventListener('input', onInput);
  $('#mAmt').addEventListener('blur', () => { $('#mAmt').value = num(parseAmt($('#mAmt').value)); });
  $('#mTerm').addEventListener('input', onInput);
  $('#mRate').addEventListener('input', onInput);
  $$('[data-ltv]', box).forEach(b => b.addEventListener('click', () => { $('#mAmt').value = num(Math.round(p.price * b.dataset.ltv / 100 / 1000) * 1000); onInput(); }));
  calc();
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
    const out = $('.ok', form);
    if (!/\S+@\S+\.\S+/.test(d.email || '') && (d.phone || '').length < 6) { out.style.color = 'var(--salina)'; out.textContent = t('form_err'); return; }
    $('button[type=submit]', form).disabled = true;
    const r = await fn('web-contact', { ...d, lang: S.lang, wp_id: p?.wp_id, reference: p?.reference, vid: S.vid }).catch(() => ({ ok: false }));
    out.style.color = ''; out.textContent = r.ok ? t('form_ok') : t('form_err');
    if (r.ok) { track('contact_sent', p?.wp_id || null, null, { kind: d.kind }); $$('input,textarea', form).forEach(i => i.type !== 'hidden' && (i.value = '')); }
    $('button[type=submit]', form).disabled = false;
  });
}
function bindSheet(p, waHref) {
  const inner = $('#sheetInner');
  $$('[data-close]', inner).forEach(b => b.addEventListener('click', closeSheet));
  $$('[data-step]', inner).forEach(b => b.addEventListener('click', () => step(Number(b.dataset.step))));
  $$('[data-track]', inner).forEach(a => a.addEventListener('click', () => track(a.dataset.track, p.wp_id)));
  $('#shShare').addEventListener('click', async () => {
    const url = location.href;
    try { if (navigator.share) await navigator.share({ title: title(p), url }); else { await navigator.clipboard.writeText(url); $('#shShare').style.background = 'var(--lemon-soft)'; } } catch {}
    track('share', p.wp_id);
  });
  $('#viewBtn').addEventListener('click', () => { const f = $('#viewForm'); f.hidden = !f.hidden; if (!f.hidden) { $('input[name=name]', f).focus(); track('contact_open', p.wp_id); } });
  bindForm($('#viewForm'), p);
  bindMortgage(p);
  $$('.quick-acts [data-go]', inner).forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.go, el = $('#' + id); if (!el) return;
    track('quick_action', p.wp_id, null, { id });
    el.scrollIntoView({ behavior: 'smooth', block: id === 'gal' ? 'start' : 'center' });
    if (id === 'chatBox') setTimeout(() => $('#chatIn').focus({ preventScroll: true }), 500);
    if (id === 'viewBtn') setTimeout(() => { $('#viewForm').hidden = false; }, 400);
    if (id === 'mortBox' || id === 'chatBox') { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); }
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
    track('assistant', p.wp_id);
    const r = await fn('web-assistant', { mode: 'ask', lang: S.lang, wp_id: p.wp_id, query: q, history: hist }).catch(() => ({}));
    const reply = r.reply || (S.lang === 'nl' ? 'Dat weet ik niet zeker. Stuur ons gerust een WhatsApp.' : "I'm not sure about that. Feel free to WhatsApp us.");
    hist.push({ role: 'user', content: q }, { role: 'assistant', content: reply });
    $('.typing', log).remove();
    log.insertAdjacentHTML('beforeend', `<div class="msg a">${esc(reply)}${r.handoff ? `<br><br>${t('handoff')} <a href="${waHref}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</div>`);
    log.scrollTop = log.scrollHeight;
    if (r.handoff) { $('#viewForm').hidden = false; }
    $('#chatSugg').innerHTML = (r.suggestions || []).slice(0, 3).map(s => `<button type="button">${esc(s)}</button>`).join('');
  };
  $('#chatSugg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) ask(b.textContent); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { $('#chatFab').hidden = es[0].isIntersecting; }, { root: $('#sheetInner'), threshold: .3 }).observe($('#chatBox'));
  $('#chatFab').addEventListener('click', () => { $('#chatBox').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#chatIn').focus({ preventScroll: true }), 400); track('assistant_fab', p.wp_id); });
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#chatIn').value; $('#chatIn').value = ''; ask(v); });
}
function fillFacts(p) {
  const kf = [];
  const add = (v, l) => v != null && v !== '' && kf.push(`<div><b>${v}</b><span>${l}</span></div>`);
  add(p.bedrooms, t('sh_bed')); add(p.bathrooms, t('sh_bath'));
  add(p.build_area && num(p.build_area) + ' m²', t('sh_built')); add(p.plot_area && num(p.plot_area) + ' m²', t('sh_plot'));
  add(dist(p.dist_sea_m), t('sh_sea'));
  if (p.pool_private) add('✓', t('pool_private')); else if (p.pool_communal) add('✓', t('pool_communal'));
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
  const body = S.lang === 'nl' ? (d.body_nl || d.body_en) : (d.body_en || d.body_nl);
  const desc = $('#desc');
  if (body) {
    desc.innerHTML = `<h3>${t('desc_h')}</h3>` + sanitize(body);
    if (desc.textContent.length > 900) {
      desc.classList.add('clamp');
      desc.insertAdjacentHTML('afterend', `<button class="btn ghost" type="button" id="readMore" style="margin:6px 0 10px">${t('read_more')}</button>`);
      $('#readMore').addEventListener('click', e => { desc.classList.remove('clamp'); e.target.remove(); track('read_more', d.wp_id); });
    }
  } else desc.innerHTML = d.summary_en ? `<p>${esc(d.summary_en)}</p>` : '';
  // features
  const feats = [];
  if (d.pool_private) feats.push(t('pool_private')); if (d.pool_communal) feats.push(t('pool_communal'));
  if (d.aircon) feats.push(t('aircon')); if (d.solarium) feats.push(t('solarium'));
  (d.features || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => feats.push(cap(s)));
  (d.terraces || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => feats.push(cap(s) + (S.lang === 'nl' ? ' terras' : ' terrace')));
  if (feats.length) $('#featBox').innerHTML = `<div class="feat" style="margin:20px 0"><h3>${t('feat_h')}</h3><ul>${[...new Set(feats)].map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
  // costs: belastingtarieven uit web_config; wij werken met één vast all-in tarief, geen losse rekeningen
  if (d.price) {
    const c = S.cfg;
    const rate = d.is_newbuild ? c.iva_newbuild_pct + c.ajd_newbuild_pct : c.itp_resale_pct;
    const tax = Math.round(d.price * rate / 100);
    const pct = v => String(v).replace('.', S.lang === 'nl' ? ',' : '.');
    const taxLbl = d.is_newbuild ? t('costs_tax_new', pct(c.iva_newbuild_pct), pct(c.ajd_newbuild_pct)) : t('costs_tax_resale', pct(c.itp_resale_pct));
    const rows = [[t('costs_price'), d.price], [taxLbl, tax]];
    const allIn = c.buyer_all_in_eur > 0 ? c.buyer_all_in_eur : null;
    if (allIn) rows.push([t('costs_allin'), allIn]);
    const total = rows.reduce((s, r) => s + Number(r[1] || 0), 0);
    const ala = [[t('costs_notary'), d.fee_notary], [t('costs_registry'), d.fee_registry], [t('costs_legal'), d.fee_legal]].filter(r => r[1]);
    $('#costBox').innerHTML = `<div class="costs"><h3>${t('costs_h')}</h3><table>${rows.map(r => `<tr><td>${r[0]}</td><td>${eur(r[1])}</td></tr>`).join('')}
      <tr class="total"><td>${allIn ? t('costs_total') : t('costs_total_ex')}</td><td>${eur(total)}</td></tr></table>
      <div class="allin"><b>${t('allin_h')}</b><p>${t('allin_p')}</p>
      ${ala.length ? `<p class="alacarte">${t('alacarte_lbl')} ${ala.map(r => `${r[0]} ${eur(r[1])}`).join(', ')}.</p>` : ''}</div>
      <p class="note">${t('costs_note')}</p></div>`;
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
}
function similar(p, n = 10) {
  const base = S.all.filter(x => x.wp_id !== p.wp_id && x.image);
  const near = base.filter(x => x.category === p.category && x.price && p.price && Math.abs(x.price - p.price) / p.price < .35)
    .sort((a, b) => (b.town === p.town) - (a.town === p.town) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price));
  return near.slice(0, n);
}
function renderMore(p) {
  const sim = similar(p);
  const area = S.all.filter(x => x.town === p.town && x.wp_id !== p.wp_id && x.image && !sim.includes(x)).slice(0, 10);
  $('#shMore').innerHTML = (sim.length ? `<h2>${t('similar_h')}</h2><div class="rail">${sim.map(x => card(x)).join('')}</div>` : '')
    + (area.length > 2 ? `<h2>${esc(t('area_h', p.town))}</h2><div class="rail">${area.map(x => card(x)).join('')}</div>` : '');
}
function step(d) {
  const list = S.order.length ? S.order : S.all;
  const i = list.findIndex(x => x.wp_id === S.openId);
  const nx = list[(i + d + list.length) % list.length];
  if (nx) { track('step', nx.wp_id, d); location.replace('#/home/' + encodeURIComponent(nx.reference)); }
}
function closeSheetTracking() {
  if (S.openId && S.openSince) track('dwell', S.openId, Math.round((Date.now() - S.openSince) / 1000));
  S.openId = null; S.openSince = 0;
}
function closeSheet() {
  closeSheetTracking();
  $('#sheet').hidden = true; document.body.style.overflow = '';
  if (location.hash.startsWith('#/home/')) location.hash = S.lastRoute || '#/';
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

// ---------- REEL: full-screen vertical browse ----------
function openReel(startIdx) {
  const list = (S.order.length ? S.order : computeOrder()).filter(p => p.image).slice(0, 120);
  const reel = $('#reel');
  reel.innerHTML = `<button class="reel-close" type="button" aria-label="${t('close')}">${ICON.x}</button><span class="reel-hint">${S.lang === 'nl' ? 'Veeg omhoog voor de volgende woning' : 'Swipe up for the next home'}</span>` +
    list.map((p, i) => `<section class="reel-item" data-id="${p.wp_id}"><img src="${esc(p.image)}" alt="${esc(title(p))}" loading="${i < 2 ? 'eager' : 'lazy'}"><span class="ref-tag reel-ref">${esc(p.reference)}</span>
      <div class="reel-cap"><div class="t"><div class="badges" style="display:flex;gap:6px;margin-bottom:6px">${badges(p)}</div>${priceHtml(p)}<h3>${esc(title(p))}</h3>${specs(p)}</div>
      <div class="reel-side"><button type="button" data-fav="${p.wp_id}" aria-pressed="${S.favs.has(p.wp_id)}" aria-label="Save">${ICON.heart}</button>
      <button type="button" data-open="${esc(p.reference)}" aria-label="Details">${ICON.info}</button>
      <button type="button" data-wa="${p.wp_id}" aria-label="WhatsApp">${ICON.wa}</button></div></div></section>`).join('');
  reel.hidden = false; document.body.style.overflow = 'hidden';
  $('.reel-close', reel).onclick = closeReel;
  reel.onclick = e => {
    const o = e.target.closest('[data-open]'); if (o) { closeReel(); location.hash = '#/home/' + encodeURIComponent(o.dataset.open); return; }
    const w = e.target.closest('[data-wa]'); if (w) { const p = S.byId.get(Number(w.dataset.wa)); const ag = agentOf(p); track('whatsapp', p.wp_id); window.open(`https://wa.me/${ag.tel.replace('+', '')}?text=${encodeURIComponent(t('wa_text', p.reference))}`, '_blank', 'noopener'); }
  };
  let seen = new Set();
  const obs = new IntersectionObserver(es => es.forEach(en => {
    en.target.classList.toggle('on', en.isIntersecting);
    const id = Number(en.target.dataset.id);
    if (en.isIntersecting && !seen.has(id)) { seen.add(id); track('reel_view', id); }
  }), { root: reel, threshold: .6 });
  $$('.reel-item', reel).forEach(x => obs.observe(x));
  reel.scrollTop = startIdx * innerHeight;
  setTimeout(() => $('.reel-hint') && $('.reel-hint').remove(), 3500);
  track('reel_open');
}
function closeReel() { $('#reel').hidden = true; $('#reel').innerHTML = ''; document.body.style.overflow = ''; }

// ---------- CONTENT PAGES ----------
function homesRail() {
  const pr = prefs();
  const items = S.all.filter(p => p.image && !p.under_offer).sort((a, b) => score(b, pr) - score(a, pr)).slice(0, 12);
  return `<section class="section"><h2>${t('home_rail')}</h2><div class="rail">${items.map(p => card(p)).join('')}</div><p><a class="btn ghost" href="#/">${t('see_all')}</a></p></section>`;
}
function pageBuy() {
  return `<div class="page-head"><h1>${t('buy_h')}</h1><p>${t('buy_p')}</p></div>
    <div class="prose"><ol class="steps">${t('buy_steps').map(([h, p]) => `<li><b>${h}</b><br>${p}</li>`).join('')}</ol><p>${t('buy_fees')}</p>
    <p><a class="btn primary" href="#/contact">${t('nav_contact')}</a></p></div>${homesRail()}`;
}
function pageSell() {
  return `<section class="page-hero">${video(VIDEO.villa)}<div><h1>${t('sell_h')}</h1><p>${t('sell_p')}</p></div></section>
    <div class="split"><div class="prose" style="padding:0">${t('sell_points').map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join('')}</div>
    <div class="box" style="background:#fff;border:1px solid var(--mist);border-radius:16px;padding:22px"><h2 style="font:400 26px var(--serif);margin:0 0 12px">${t('sell_form_h')}</h2>
    <form class="form" id="sellForm">${contactFields('valuation')}</form></div></div>`;
}
function pageMove() {
  return `<section class="page-hero">${video(VIDEO.village)}<div><h1>${t('move_h')}</h1><p>${t('move_p')}</p></div></section>
    <div class="prose">${t('move_body').map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join('')}<p><a class="btn primary" href="#/contact">${t('nav_contact')}</a></p></div>${homesRail()}`;
}
function pageTeam() {
  return `<div class="page-head"><h1>${t('team_h')}</h1><p>${t('team_p')}</p></div>
    <div class="team">${[2, 3, 4, 6].map(id => { const a = AGENTS[id]; return `<div class="member"><div class="av">${a.short[0]}</div><h3>${a.name}</h3><p>${a.role[S.lang]}</p>
    <a class="btn wa" style="padding:9px 16px;font-size:15px" target="_blank" rel="noopener" href="https://wa.me/${a.tel.replace('+', '')}">WhatsApp</a></div>`; }).join('')}</div>${homesRail()}`;
}
async function pageNews() {
  $('#main').innerHTML = `<div class="page-head"><h1>${t('news_h')}</h1><p>${t('news_p')}</p></div><ul class="news" id="newsList"><li class="skeleton" style="height:60px"></li></ul><section class="section">${newsletterHtml('inline')}</section>${homesRail()}`;
  bindNewsletters($('#main'));
  const rows = await api('web_news?select=title,url,posted_at,source&order=posted_at.desc&limit=40').catch(() => []);
  const fmt = d => new Date(d).toLocaleDateString(S.lang === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'long' });
  $('#newsList').innerHTML = rows.map(r => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a><small>${esc(r.source)}, ${fmt(r.posted_at)}</small></li>`).join('') || '<li>—</li>';
}
function pageContact() {
  return `<div class="page-head"><h1>${t('contact_h')}</h1><p>${t('contact_p')}</p></div>
  <div class="split"><div>
    <p><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/34664414515">WhatsApp</a> &nbsp; <a class="btn ghost" href="tel:+34966792113">+34 966 792 113</a></p>
    <h2 style="font:400 26px var(--serif);margin:28px 0 6px">${t('office')}</h2>
    <p>Grupo Soltura Real Estate<br>Avda. de la Constitución s/n<br>03179 Formentera del Segura, Alicante</p>
    <div class="team" style="padding:10px 0">${[2, 3, 4, 6].map(id => { const a = AGENTS[id]; return `<div class="member" style="padding:14px"><h3 style="font-size:17px">${a.name}</h3><p style="margin:2px 0 8px;font-size:14px">${a.role[S.lang]}</p><a target="_blank" rel="noopener" href="https://wa.me/${a.tel.replace('+', '')}">WhatsApp</a></div>`; }).join('')}</div>
  </div>
  <div class="box" style="background:#fff;border:1px solid var(--mist);border-radius:16px;padding:22px"><form class="form" id="contactForm">${contactFields('contact')}</form></div></div>`;
}
function pageFavs() {
  const items = [...S.favs].map(id => S.byId.get(id)).filter(Boolean);
  if (!items.length) return `<div class="empty"><h2>${t('fav_h')}</h2><p>${t('fav_empty')}</p><p><a class="btn primary" href="#/">${t('see_all')}</a></p></div>`;
  return `<div class="page-head"><h1>${t('fav_h')}</h1></div><section class="feed">${items.map(p => card(p)).join('')}</section>${homesRail()}`;
}

// ---------- router ----------
let currentPage = null;
function route() {
  const h = location.hash || '#/';
  const m = h.match(/^#\/home\/(.+)$/);
  if (m) {
    if (!currentPage) renderPage('#/');
    if (S.all.length) openSheet(decodeURIComponent(m[1]));
    return;
  }
  if (!$('#sheet').hidden) { closeSheetTracking(); $('#sheet').hidden = true; document.body.style.overflow = ''; }
  S.lastRoute = h;
  renderPage(h);
}
function renderPage(h) {
  const key = (h.replace('#/', '').split('/')[0]) || 'home';
  currentPage = key;
  $$('.nav a').forEach(a => { if (a.dataset.route === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  const main = $('#main');
  window.scrollTo(0, 0);
  switch (key) {
    case 'buy': main.innerHTML = pageBuy(); break;
    case 'sell': main.innerHTML = pageSell(); bindForm($('#sellForm')); break;
    case 'move': main.innerHTML = pageMove(); break;
    case 'team': main.innerHTML = pageTeam(); break;
    case 'news': pageNews(); break;
    case 'contact': main.innerHTML = pageContact() + `<section class="section">${newsletterHtml('inline')}</section>`; bindForm($('#contactForm')); bindNewsletters(main); break;
    case 'favorites': main.innerHTML = pageFavs(); break;
    default: currentPage = 'home'; renderHome();
  }
  observeCards(main);
  document.title = key === 'home' ? 'Grupo Soltura · ' + t('hero_title') : `${t('nav_' + ({ buy: 'buy', sell: 'sell', move: 'move', team: 'team', news: 'news', contact: 'contact' }[key] || 'homes'))} · Grupo Soltura`;
}
window.addEventListener('hashchange', route);

// ---------- language, menu ----------
function applyLang() {
  document.documentElement.lang = S.lang;
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === S.lang));
}
$$('.lang button').forEach(b => b.addEventListener('click', () => {
  if (S.lang === b.dataset.lang) return;
  S.lang = b.dataset.lang; ls.set('lang', S.lang); applyLang();
  const open = location.hash.startsWith('#/home/');
  renderPage(S.lastRoute);
  if (open) openSheet(decodeURIComponent(location.hash.slice(7)));
}));
$('#menuBtn').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', o); });
$('#waFloat').addEventListener('click', () => track('whatsapp'));
$$('.top [data-track]').forEach(a => a.addEventListener('click', () => track(a.dataset.track, null, null, { from: 'header' })));
// header: hoogte doorgeven aan de sticky filterbalk en compact maken bij scrollen
(() => {
  const top = $('#top');
  const setH = () => document.documentElement.style.setProperty('--top-h', top.offsetHeight + 'px');
  if ('ResizeObserver' in window) new ResizeObserver(setH).observe(top); else setH();
  let compact = false;
  addEventListener('scroll', () => { const c = scrollY > 40; if (c !== compact) { compact = c; top.classList.toggle('compact', c); } }, { passive: true });
})();

// ---------- boot ----------
async function boot() {
  applyLang(); favCount();
  const qp = new URLSearchParams(location.search);
  if (qp.get('lang') === 'nl' || qp.get('lang') === 'en') { S.lang = qp.get('lang'); applyLang(); }
  route();
  api('web_config?select=key,value').then(rows => rows.forEach(r => { S.cfg[r.key] = Number(r.value); })).catch(() => {});
  try {
    S.all = await api(`web_properties?select=${LIST_COLS}`);
  } catch (e) {
    $('#main').insertAdjacentHTML('afterbegin', `<div class="empty"><h2>${S.lang === 'nl' ? 'Het aanbod laadt even niet' : 'Listings could not load'}</h2><p>${S.lang === 'nl' ? 'Ververs de pagina, of bel ons op +34 966 792 113.' : 'Refresh the page, or call us on +34 966 792 113.'}</p></div>`);
    return;
  }
  S.all.forEach(p => { S.byRef.set(String(p.reference).toUpperCase(), p); S.byId.set(p.wp_id, p); });
  // keep only favourites/viewed that still exist
  S.favs = new Set([...S.favs].filter(id => S.byId.has(id))); ls.set('favs', [...S.favs]); favCount();
  if (currentPage === 'home') { countUp(); renderBar(); renderFeed(); }
  else renderPage(S.lastRoute);
  const m = location.hash.match(/^#\/home\/(.+)$/);
  if (m) openSheet(decodeURIComponent(m[1]));
}
boot();
})();
