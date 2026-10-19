/* Grupo Soltura — URL-schema (echte paden per taal). Gedeeld door de app (window.ROUTES),
   het buildscript (scripts/build.mjs) en de redirects (404.html / Cloudflare Worker).
   Schema (besluit 19-10-2026): /en/ en /nl/ met voorvoegsel, / = Engelse inhoud met canonical naar /en/.
   Woning: /en/property/<ref>-<soort>-<plaats>/ · /nl/woning/<ref>-<soort>-<plaats>/ — de referentie is de sleutel,
   de rest is leesbaar en mag veranderen (een afwijkend leesbaar deel wordt doorgestuurd naar de canonieke vorm). */
(function (root) {
  'use strict';
  var LANGS = ['en', 'nl'];
  // routesleutel -> padsegment per taal ('' = startpagina van die taal)
  var SEG = {
    home: { en: '', nl: '' },
    buy: { en: 'buying', nl: 'kopen' },
    sell: { en: 'selling', nl: 'verkopen' },
    move: { en: 'move-to-spain', nl: 'emigreren' },
    area: { en: 'areas', nl: 'woonplaatsen' },
    guide: { en: 'living-in', nl: 'wonen-in' },
    news: { en: 'news', nl: 'nieuws' },
    contact: { en: 'contact', nl: 'contact' },
    privacy: { en: 'privacy', nl: 'privacy' },
    favorites: { en: 'favorites', nl: 'favorieten' },
    property: { en: 'property', nl: 'woning' },
  };
  // segment -> sleutel (beide talen; ook een segment uit de andere taal wordt herkend en daarna rechtgezet)
  var BYSEG = {};
  Object.keys(SEG).forEach(function (k) { LANGS.forEach(function (l) { if (SEG[k][l]) BYSEG[SEG[k][l]] = k; }); });

  var CAT = {
    en: { quadrant: 'Quad house', 'semi-detached': 'Semi-detached', attic: 'Penthouse', other: 'Home' },
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
    lang = lang === 'nl' ? 'nl' : 'en';
    var s = SEG[key] ? SEG[key][lang] : '';
    if (key === 'property') {
      var a = typeof arg === 'string' ? arg.toLowerCase() : propSlug(arg, lang);
      return '/' + lang + '/' + s + '/' + a + '/';
    }
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
    if (!key) return null;
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
    var map = { '': 'home', buy: 'buy', sell: 'sell', move: 'move', contact: 'contact', team: 'contact', privacy: 'privacy', favorites: 'favorites' };
    var path;
    if (k === 'home' && a) path = href(lang, 'property', a);
    else if (k === 'area') path = a ? href(lang, 'guide', a.toLowerCase()) : href(lang, 'area');
    else if (k === 'news') path = href(lang, 'news', a || null);
    else if (map[k] != null) path = href(lang, map[k]);
    else path = href(lang, 'home');
    return path + q;
  }

  var api = { LANGS: LANGS, SEG: SEG, href: href, parse: parse, fromHash: fromHash, propSlug: propSlug, refFromSlug: refFromSlug, catName: catName, fold: fold, slugify: slugify, placeOf: placeOf, placeLabel: placeLabel };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ROUTES = api;
})(typeof self !== 'undefined' ? self : this);
