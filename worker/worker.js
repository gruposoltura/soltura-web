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

// ---- js/routes.js ----
/* Grupo Soltura — URL-schema (echte paden per taal). Gedeeld door de app (window.ROUTES),
   het buildscript (scripts/build.mjs) en de redirects (404.html / Cloudflare Worker).
   Schema (besluit 19-10-2026): /en/, /nl/ en (sinds 19-10) /sv/ met voorvoegsel, / = Engelse inhoud met canonical naar /en/.
   Woning: /en/property/<ref>-<soort>-<plaats>/ · /nl/woning/<ref>-<soort>-<plaats>/ — de referentie is de sleutel,
   de rest is leesbaar en mag veranderen (een afwijkend leesbaar deel wordt doorgestuurd naar de canonieke vorm). */
(function (root) {
  'use strict';
  var LANGS = ['en', 'nl', 'sv'];
  // routesleutel -> padsegment per taal ('' = startpagina van die taal)
  var SEG = {
    home: { en: '', nl: '', sv: '' },
    buy: { en: 'buying', nl: 'kopen', sv: 'kopa' },
    sell: { en: 'selling', nl: 'verkopen', sv: 'salja' },
    move: { en: 'move-to-spain', nl: 'emigreren', sv: 'flytta-till-spanien' },
    area: { en: 'areas', nl: 'woonplaatsen', sv: 'orter' },
    guide: { en: 'living-in', nl: 'wonen-in', sv: 'bo-i' },
    news: { en: 'news', nl: 'nieuws', sv: 'nyheter' },
    contact: { en: 'contact', nl: 'contact', sv: 'kontakt' },
    privacy: { en: 'privacy', nl: 'privacy', sv: 'integritet' },
    favorites: { en: 'favorites', nl: 'favorieten', sv: 'favoriter' },
    property: { en: 'property', nl: 'woning', sv: 'bostad' },
    // woon/koopgids met live assistent Sola (23-10-2026)
    gids: { en: 'buying-guide', nl: 'woongids', sv: 'kopguide' },
    // makelaarsportaal (24-10-2026): niet in menu of sitemap, noindex; agents.gruposoltura.com verwijst hierheen
    agents: { en: 'agents', nl: 'makelaars', sv: 'maklare' },
  };
  // subpagina's onder een vaste pagina (22-10-2026): maandlastencalculator onder Emigreren
  // /nl/emigreren/maandlasten/ . /en/move-to-spain/monthly-costs/ . /sv/flytta-till-spanien/manadskostnader/
  var COSTS = { en: 'monthly-costs', nl: 'maandlasten', sv: 'manadskostnader' };
  function isCosts(s) { s = String(s || '').toLowerCase(); for (var l in COSTS) if (COSTS[l] === s) return true; return false; }
  // segment -> sleutel (beide talen; ook een segment uit de andere taal wordt herkend en daarna rechtgezet)
  var BYSEG = {};
  Object.keys(SEG).forEach(function (k) { LANGS.forEach(function (l) { if (SEG[k][l]) BYSEG[SEG[k][l]] = k; }); });

  var CAT = {
    en: { quadrant: 'Quad house', 'semi-detached': 'Semi-detached', attic: 'Penthouse', other: 'Home' },
    sv: { villa: 'Villa', apartment: 'L\u00e4genhet', bungalow: 'Bungalow', detached: 'Frist\u00e5ende hus', townhouse: 'Radhus', penthouse: 'Takv\u00e5ning', quadrant: 'Kedjehus (quad)', duplex: 'Duplex', finca: 'Finca', 'semi-detached': 'Parhus', commercial: 'Lokal', other: 'Bostad', plot: 'Tomt', attic: 'Takv\u00e5ning' },
    nl: { villa: 'Villa', apartment: 'Appartement', bungalow: 'Bungalow', detached: 'Vrijstaand huis', townhouse: 'Rijtjeshuis', penthouse: 'Penthouse', quadrant: 'Hoekwoning (quad)', duplex: 'Duplex', finca: 'Finca', 'semi-detached': 'Twee-onder-een-kap', commercial: 'Bedrijfspand', other: 'Woning', plot: 'Bouwgrond', attic: 'Penthouse' },
  };
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
  function catName(c, lang) { return (CAT[lang] || CAT.en)[c] || cap(c); }
  function fold(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function slugify(s) { return fold(s).replace(/ /g, '-'); }
  // wijk alleen in de URL als die iets toevoegt (niet 'Town Center', niet gelijk aan de plaats)
  function placeOf(p) {
    var sub = p.suburb, town = p.town;
    if (sub && fold(sub) !== fold(town) && !/\b(town|centre|center|centro|village|country|costa)\b/i.test(fold(sub))) return sub;
    return town || sub || '';
  }
  // leesbare plaats voor titels: "Ciudad Quesada, Rojales" of alleen "Rojales" (geen 'Town Center' e.d.)
  function placeLabel(p) {
    var pl = placeOf(p);
    return pl && p.town && fold(pl) !== fold(p.town) ? pl + ', ' + p.town : (p.town || pl || '');
  }
  function propSlug(p, lang) {
    var parts = [String(p.reference || '').toLowerCase(), slugify(catName(p.category, lang)), slugify(placeOf(p))];
    return parts.filter(Boolean).join('-').replace(/-+/g, '-');
  }
  function refFromSlug(s) { var r = String(s || '').split('-')[0]; return /^[a-z0-9]+$/i.test(r) ? r.toUpperCase() : null; }

  // href(lang, key, arg) -> pad. key 'property' verwacht arg = woning-object (of {reference, category, town, suburb}) of een referentie.
  function href(lang, key, arg) {
    lang = LANGS.indexOf(lang) >= 0 ? lang : 'en';
    var s = SEG[key] ? SEG[key][lang] : '';
    if (key === 'property') {
      var a = typeof arg === 'string' ? arg.toLowerCase() : propSlug(arg, lang);
      return '/' + lang + '/' + s + '/' + a + '/';
    }
    if (key === 'costs') return '/' + lang + '/' + SEG.move[lang] + '/' + COSTS[lang] + '/';
    if (key === 'guide') return '/' + lang + '/' + s + '/' + encodeURIComponent(arg) + '/';
    if (key === 'news' && arg) return '/' + lang + '/' + s + '/' + encodeURIComponent(arg) + '/';
    return '/' + lang + '/' + (s ? s + '/' : '');
  }

  // parse(pathname) -> { lang, key, arg, canonicalLang } of null (geen route van de site)
  // lang = null betekent: pad zonder taal ('/'), de app kiest de taal.
  function parse(pathname) {
    var p = String(pathname || '/');
    try { p = decodeURIComponent(p); } catch (e) {}
    p = p.replace(/\/index\.html$/, '/').replace(/\/{2,}/g, '/');
    var parts = p.split('/').filter(Boolean);
    if (!parts.length) return { lang: null, key: 'home', arg: null };
    var lang = parts[0].toLowerCase();
    if (LANGS.indexOf(lang) < 0) return null;
    var seg = (parts[1] || '').toLowerCase(), rest = parts.slice(2);
    if (!seg) return { lang: lang, key: 'home', arg: null };
    var key = BYSEG[seg];
    if (!key) return isCosts(seg) ? { lang: lang, key: 'costs', arg: null } : null; // ook /nl/maandlasten/ (wordt rechtgezet)
    if (key === 'move' && rest[0]) return isCosts(rest[0]) ? { lang: lang, key: 'costs', arg: null } : { lang: lang, key: 'move', arg: null };
    if (key === 'property') { var ref = refFromSlug(rest[0]); return ref ? { lang: lang, key: key, arg: ref, slug: rest[0] } : { lang: lang, key: 'home', arg: null }; }
    if (key === 'guide') return rest[0] ? { lang: lang, key: 'guide', arg: rest[0].toLowerCase() } : { lang: lang, key: 'area', arg: null };
    if (key === 'area') return rest[0] ? { lang: lang, key: 'guide', arg: rest[0].toLowerCase() } : { lang: lang, key: 'area', arg: null };
    if (key === 'news') return { lang: lang, key: 'news', arg: rest[0] || null };
    return { lang: lang, key: key, arg: null };
  }

  // oude hash-route (#/home/RH550, #/area/rojales, #/news/x, #/favorites?add=..) -> nieuw pad + query
  function fromHash(hash, lang) {
    var h = String(hash || '').replace(/^#/, '');
    if (h.charAt(0) !== '/') return null;
    var q = '', i = h.indexOf('?');
    if (i >= 0) { q = h.slice(i); h = h.slice(0, i); }
    var parts = h.split('/').filter(Boolean).map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    var k = parts[0] || '', a = parts[1] || '';
    var map = { costs: 'costs', '': 'home', buy: 'buy', sell: 'sell', move: 'move', contact: 'contact', team: 'contact', privacy: 'privacy', favorites: 'favorites' };
    var path;
    if (k === 'home' && a) path = href(lang, 'property', a);
    else if (k === 'area') path = a ? href(lang, 'guide', a.toLowerCase()) : href(lang, 'area');
    else if (k === 'news') path = href(lang, 'news', a || null);
    else if (map[k] != null) path = href(lang, map[k]);
    else path = href(lang, 'home');
    return path + q;
  }

  // ---------- interne links in woningomschrijvingen (besluit Rick 19-10-2026) ----------
  // Bij het tonen (statische build en app) wordt de eerste vermelding van elke plaats met een woonplaatsgids
  // een link naar die gids. De tekst in de database blijft schoon, zodat XML-feeds, Idealista en de NEXUS-editor
  // geen HTML-links krijgen, en nieuwe woningen (import en eigen invoer) vanzelf mee gaan bij de volgende build.
  // Alleen ASCII in dit bestand (\u-escapes), omdat het ook in de Worker wordt geplakt.
  var LINK_MAX = 3; // hoogstens 3 plaatslinks per omschrijving, elke gids hoogstens 1x
  // te algemene of misleidende wijknamen: nooit als link
  var LINK_SKIP = ['centro', 'el campo', 'los altos', 'la fiesta', 'airstrip', 'torreta', 'la florida', 'fontana', 'la finca', 'san luis',
    'el raso', 'la siesta', 'los locos', 'villa rosa', 'la bodega', 'montebello', 'monte bello', 'montemar', 'las ramblas', 'aguamarina',
    'blue hill', 'eagles nest', 'upper golf', 'lo pepin', 'atalaya park', 'la escuera', 'la cruz de galindo', 'cruz de galindo', 'la erica',
    'la eralta', 'el raiguero', 'los palacios', 'la herrada', 'el oasis', 'los secanos', 'el campo', 'los estanos', 'la canada', 'pau 26', 'el barranco'];
  var ACC = { a: 'a\u00e0\u00e1\u00e2\u00e4', e: 'e\u00e8\u00e9\u00ea\u00eb', i: 'i\u00ec\u00ed\u00ee\u00ef', o: 'o\u00f2\u00f3\u00f4\u00f6', u: 'u\u00f9\u00fa\u00fb\u00fc', n: 'n\u00f1' };
  function termRe(term) { // accent- en hoofdletterongevoelig, spaties/koppeltekens flexibel
    return fold(term).split(' ').map(function (w) {
      return w.split('').map(function (c) { return ACC[c] ? '[' + ACC[c] + ACC[c].toUpperCase() + ']' : (/[a-z]/.test(c) ? '[' + c + c.toUpperCase() + ']' : c); }).join('');
    }).join('[\\s\\-]+');
  }
  function linkTerms(guides) {
    var seen = {}, dup = {}, out = [];
    (guides || []).forEach(function (g) { (g.aliases || []).forEach(function (a) { var k = fold(a); if (seen[k] && seen[k] !== g.slug) dup[k] = 1; seen[k] = g.slug; }); });
    (guides || []).forEach(function (g) {
      var terms = [g.town];
      var short = String(g.town || '').split(/\s+de(l)?\s+/i)[0]; // Guardamar, Formentera, San Miguel
      if (short && short !== g.town && short.length >= 6) terms.push(short);
      (g.aliases || []).forEach(function (a) {
        var k = fold(a);
        if (!k || dup[k] || LINK_SKIP.indexOf(k) >= 0 || k.length < 5 || /[(\-]|\s-\s/.test(a) || a.charAt(0) !== a.charAt(0).toUpperCase()) return;
        terms.push(a);
      });
      var uniq = {};
      terms.forEach(function (t) { var k = fold(t); if (k && !uniq[k]) { uniq[k] = 1; out.push({ slug: g.slug, k: k, re: termRe(t) }); } });
    });
    return out.sort(function (a, b) { return b.k.length - a.k.length; }); // langste eerst: Ciudad Quesada voor Quesada
  }
  // eigen oude absolute links (WordPress) omzetten naar het nieuwe pad; null = geen eigen link
  function ownLink(url, lang, slugs) {
    var m = String(url || '').replace(/&amp;/g, '&').match(/^https?:\/\/(?:www\.)?gruposoltura\.com(\/[^?#]*)?(\?[^#]*)?/i);
    if (!m) return null;
    var p = (m[1] || '/').toLowerCase(), g = p.match(/\/(?:woning-kopen-in-|buying-property-in-|wonen-in\/|living-in\/|area\/|woonplaatsen\/|areas\/)([a-z0-9\-]+)/);
    if (g && slugs && slugs[g[1]]) return href(lang, 'guide', g[1]);
    if (/^\/(en|nl|sv)\//.test(p) && parse(p)) return p;
    return href(lang, 'home');
  }
  // html: al opgeschoonde omschrijving. guides: woonplaatsgidsen in deze taal (slug, town, aliases).
  function linkTowns(html, guides, lang) {
    html = String(html || '');
    if (!html || !guides || !guides.length) return html;
    var terms = linkTerms(guides);
    if (!terms.length) return html;
    var done = {}, n = 0;
    // gidsen waar al een link naar staat niet nog eens linken
    terms.forEach(function (t) { if (html.indexOf(href(lang, 'guide', t.slug)) >= 0) done[t.slug] = 1; });
    var big = new RegExp('(^|[^0-9A-Za-z\u00c0-\u024f])(' + terms.map(function (t) { return t.re; }).join('|') + ')(?![0-9A-Za-z\u00c0-\u024f])', 'g');
    var depth = 0; // binnen <a> of kop: niet linken
    return html.split(/(<[^>]*>)/).map(function (part) {
      if (part.charAt(0) === '<') {
        var m = part.match(/^<(\/?)(a|h[1-4])\b/i);
        if (m) depth = Math.max(0, depth + (m[1] ? -1 : 1));
        return part;
      }
      if (depth || n >= LINK_MAX) return part;
      return part.replace(big, function (all, pre, word) {
        if (n >= LINK_MAX || word.charAt(0) !== word.charAt(0).toUpperCase()) return all;
        var k = fold(word), t = null;
        for (var i = 0; i < terms.length; i++) if (terms[i].k === k) { t = terms[i]; break; }
        if (!t || done[t.slug]) return all;
        done[t.slug] = 1; n++;
        return pre + '<a class="town-link" href="' + href(lang, 'guide', t.slug) + '">' + word + '</a>';
      });
    }).join('');
  }

  var api = { LANGS: LANGS, SEG: SEG, href: href, parse: parse, fromHash: fromHash, propSlug: propSlug, refFromSlug: refFromSlug, catName: catName, fold: fold, slugify: slugify, placeOf: placeOf, placeLabel: placeLabel, linkTowns: linkTowns, ownLink: ownLink };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ROUTES = api;
})(typeof self !== 'undefined' ? self : this);

// ---- js/resolve.js ----
/* Grupo Soltura — doorverwijzingen naar de nieuwe URL's (19-10-2026).
   solturaResolve(path, search, M, RT) -> nieuw pad ('/nl/kopen/', '/en/property/abc2407-villa-rojales/', ...) of null.
   M = /redirects.json (oude WordPress-paden), RT = /routes.json (uit de build: woning -> canonieke URL, verdwenen woning -> gids,
   plaatsnaam -> gids). Vereist ROUTES (js/routes.js). Gedeeld door 404.html (GitHub Pages) en de Cloudflare Worker (301). */
(function (root) {
'use strict';
var R = root.ROUTES || (typeof require === 'function' ? require('./routes.js') : null);
// Oude WordPress-paden -> oude hash-doelen ("/?lang=nl#/buy", "/#/home/ABC2407", "/?town=Rojales#/"). Ongewijzigd t.o.v. 18-10-2026.
function legacyTarget(path, search, M) {
  var p = String(path || '/');
  try { p = decodeURIComponent(p); } catch (e) {}
  p = p.toLowerCase().replace(/\/{2,}/g, '/');
  if (p.slice(-1) !== '/' && !/\.[a-z0-9]{2,5}$/.test(p)) p += '/';
  var qs = {};
  String(search || '').replace(/^\?/, '').split('&').forEach(function (kv) {
    if (!kv) return; var i = kv.indexOf('='); var k = i < 0 ? kv : kv.slice(0, i);
    var v = i < 0 ? '' : kv.slice(i + 1); try { v = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) {}
    qs[k.toLowerCase()] = v;
  });
  var key = function (r) { return String(r).toLowerCase().replace(/[^a-z0-9]/g, ''); };
  if (!M._live) { M._live = {}; String(M.live || '').split(' ').forEach(function (r) { if (r) M._live[key(r)] = r; }); }
  if (!M._ts) { M._ts = Object.keys(M.ts || {}).sort(function (a, b) { return b.length - a.length; }); }
  var lang = null, rest = p, m = p.match(/^\/(nl|en|es|de)(\/.*)$/);
  if (m) { lang = m[1] === 'nl' ? 'nl' : (m[1] === 'en' ? 'en' : null); rest = m[2]; }
  var out = function (hash, town) {
    var q = [];
    if (lang) q.push('lang=' + lang);
    if (town) q.push('town=' + encodeURIComponent(town));
    return '/' + (q.length ? '?' + q.join('&') : '') + hash;
  };
  var townOf = function (s, skipProvince) {
    var x = '-' + s + '-';
    for (var i = 0; i < M._ts.length; i++) {
      var t = M._ts[i];
      if (skipProvince && (t === 'alicante' || t === 'murcia' || t === 'costa-blanca')) continue;
      if (x.indexOf('-' + t + '-') >= 0) return M.tn[M.ts[t]];
    }
    return null;
  };
  var prop = function (s) {
    var ref = key(s.split('-').pop());
    if (M._live[ref]) return out('#/home/' + M._live[ref]);
    if (M.rt && M.rt[ref] != null) return out('#/', M.tn[M.rt[ref]]);
    return out('#/', townOf(s, true));
  };

  // 1. vaste pagina's (inclusief /nl/ en /en/)
  if (M.pg && M.pg[p]) return M.pg[p];
  // 2. WordPress-shortlinks en zoek-URL's op de root
  if (rest === '/') {
    var id = qs.p || qs.page_id || qs.post;
    if (id && M.w && M.w[id]) return out('#/home/' + M.w[id]);
    if (qs.property) return prop(qs.property);
    if (id || qs.s != null || qs.post_type || qs.cpr_search != null) return out('#/');
    return null; // gewone homepage
  }
  // 3. woningen
  if ((m = rest.match(/^\/(property|properties|object|woning|propiedad)\/([^\/]+)\//))) return prop(m[2]);
  if ((m = rest.match(/^\/(property|properties|object|woning)\/$/))) return out('#/');
  // 4. locatiepagina's
  if ((m = rest.match(/^\/(location|locations|locatie|locaties)\/([^\/]+)\/(?:([^\/]+)\/)?/))) {
    if (!lang && m[1].indexOf('locatie') === 0) lang = 'nl';
    var t = (M.ts[m[2]] != null ? M.tn[M.ts[m[2]]] : null) || (m[3] && M.ts[m[3]] != null ? M.tn[M.ts[m[3]]] : null) || townOf(m[2] + (m[3] ? '-' + m[3] : ''), false);
    return out('#/', t);
  }
  if ((m = rest.match(/^\/(?:buying-property-in|woning-kopen-in|comprar-casa-en)-([^\/]+)\/$/))) return out('#/', townOf(m[1], false));
  // 5. overige WordPress-paden
  if (/^\/(author|team|agent)\//.test(rest)) return out('#/contact');
  if (/^\/(blog|category|tag|news|nieuws|feed|comments)\//.test(rest)) return out('#/news');
  if (/^\/(my-soltura|mijn-soltura|my-account|favorites|favorieten)\//.test(rest)) return out('#/favorites');
  if (/^\/(privacy|cookie)/.test(rest)) return out('#/privacy');
  if (/^\/(contact|kontakt|contacto)\//.test(rest)) return out('#/contact');
  if (/sitemap[^\/]*\.xml$/.test(rest)) return '/sitemap.xml';
  if (/^\/(wp-content|wp-includes|wp-json|wp-admin|unsubscribe)\b/.test(rest)) return null; // de Worker regelt deze apart
  // 6. berichten staan onder /nl/<slug>/ en /en/<slug>/ -> nieuwsoverzicht
  if (lang && /^\/[^\/]+\/$/.test(rest)) return out('#/news');
  // 7. onbekend oud pad
  if (/\.(php|html?|aspx?)$/.test(rest) || /^\/[^.]*\/$/.test(rest)) return out('#/');
  return null;
}

// Nederlandstalige oude paden zonder /nl/: Nederlandse doelpagina
var NL_WORDS = /^\/(kopen|verkopen|nieuws|nieuwsbrief|woning|locatie|locaties|mijn-soltura|favorieten|verhuizen-naar-spanje|makelaars|aanrader|bestellen|belangrijk|investeren|vastgoed|geheime-deals|boek-een-bezichtiging|door-homedecobali|privacy-en-cookie-info|woning-kopen-in)/;
function guideOfTown(town, RT) {
  if (!town || !RT || !RT.towns) return null;
  var k = R.fold(town);
  if (RT.towns[k]) return RT.towns[k];
  // 'Formentera de Segura' = 'Formentera del Segura': lidwoorden en voorzetsels negeren
  var loose = function (x) { return x.replace(/\b(de|del|la|las|los|el|l)\b/g, ' ').replace(/\s+/g, ' ').trim(); };
  var lk = loose(k);
  for (var t in RT.towns) if (loose(t) === lk) return RT.towns[t];
  return null;
}
// oud hash-doel -> nieuw pad
function convert(target, lang, RT) {
  var u = String(target), hash = '', q = '';
  var i = u.indexOf('#'); if (i >= 0) { hash = u.slice(i); u = u.slice(0, i); }
  i = u.indexOf('?'); if (i >= 0) { q = u.slice(i + 1); u = u.slice(0, i); }
  if (u !== '/' && u !== '') return u; // al een pad (bv. /sitemap.xml)
  var town = null;
  q.split('&').forEach(function (kv) { var p = kv.split('='); if (p[0] === 'lang' && (p[1] === 'nl' || p[1] === 'en')) lang = p[1]; if (p[0] === 'town') { try { town = decodeURIComponent(p[1].replace(/\+/g, ' ')); } catch (e) { town = p[1]; } } });
  lang = lang || 'en';
  var m = hash.match(/^#\/home\/([^\/?]+)/);
  if (m) return propPath(m[1], lang, RT);
  if (town && (hash === '#/' || hash === '')) { var g = guideOfTown(town, RT); return g ? R.href(lang, 'guide', g) : R.href(lang, 'home'); }
  return R.fromHash(hash || '#/', lang);
}
function propPath(ref, lang, RT) {
  var k = String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (RT && RT.props && RT.props[k]) return RT.props[k][lang] || RT.props[k].en;
  if (RT && RT.gone && k in RT.gone) return RT.gone[k] ? R.href(lang, 'guide', RT.gone[k]) : R.href(lang, 'home');
  return R.href(lang, 'property', k.toLowerCase());
}
function solturaResolve(path, search, M, RT) {
  var p = String(path || '/');
  try { p = decodeURIComponent(p); } catch (e) {}
  // 1. nieuwe paden die (niet meer) bestaan
  var r = R.parse(p);
  if (r && r.lang) {
    if (r.key === 'property' && r.slug) {
      var k = r.arg;
      if (RT && RT.props && RT.props[k]) { var c = RT.props[k][r.lang]; return c && c !== p ? c : null; }
      if (RT && RT.gone && k in RT.gone) return RT.gone[k] ? R.href(r.lang, 'guide', RT.gone[k]) : R.href(r.lang, 'home');
      // onbekende referentie in het nieuwe formaat (bv. na de laatste build gepubliceerd): de app (404.html) zoekt hem live op
      if (/^[a-z]{1,6}\d{2,6}$/i.test(k)) return null;
      // anders misschien een oude WordPress-woning-URL (/en/property/villa-...-abc2407/), zie verder
    } else if (r.key === 'guide') {
      if (RT && RT.guides && RT.guides[r.arg]) { var gp = R.href(r.lang, 'guide', r.arg); return gp !== p ? gp : null; }
      var g = guideOfTown(r.arg.replace(/-/g, ' '), RT);
      return g ? R.href(r.lang, 'guide', g) : R.href(r.lang, 'area');
    } else if (r.key === 'news' && r.arg) {
      return R.href(r.lang, 'news');
    }
  }
  // 2. oude locatiepagina's: eerst de wijk/plaats uit het pad zelf (Ciudad Quesada heeft een eigen gids, WordPress hing hem onder Rojales)
  var lm0 = String(p).toLowerCase().match(/^\/(?:(nl|en|es|de)\/)?(?:(?:location|locations|locatie|locaties)\/([^\/]+)\/(?:([^\/]+)\/)?|(?:buying-property-in|woning-kopen-in|comprar-casa-en)-([^\/]+)\/)/);
  if (lm0) {
    var gl = guideOfTown((lm0[3] || '').replace(/-/g, ' '), RT) || guideOfTown((lm0[2] || lm0[4] || '').replace(/-/g, ' '), RT);
    var ll = lm0[1] === 'nl' || (!lm0[1] && /^\/(locatie|woning-kopen-in)/.test(String(p).toLowerCase())) ? 'nl' : 'en';
    if (gl) return R.href(ll, 'guide', gl);
  }
  // 3. oude WordPress-paden
  var t = legacyTarget(path, search, M);
  if (!t) return null;
  var lp = String(p).toLowerCase(), lang = null, lm = lp.match(/^\/(nl|en)\//);
  if (lm) lang = lm[1]; else if (NL_WORDS.test(lp)) lang = 'nl';
  // oude woning-URL's: referentie staat achteraan; met routes.json direct naar de canonieke URL
  var out = convert(t, lang, RT);
  return out === p ? null : out;
}
var api = { solturaResolve: solturaResolve, legacyTarget: legacyTarget, convert: convert };
if (typeof module === 'object' && module.exports) module.exports = api;
else { root.solturaResolve = solturaResolve; root.SOLTURA_RESOLVE = api; }
})(typeof self !== 'undefined' ? self : this);

const solturaResolve = self.solturaResolve;

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
