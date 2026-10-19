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
  };
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
