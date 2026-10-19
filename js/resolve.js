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
