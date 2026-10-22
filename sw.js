// Grupo Soltura website - service worker.
// Netwerk eerst (altijd de nieuwste versie en het actuele aanbod); de cache is alleen een vangnet bij geen verbinding.
// v5 (19-10-2026): echte paden per taal (/en/..., /nl/...); elke pagina heeft een eigen index.html.
const V = 'soltura-v7';
const SHELL = ['/', '/index.html', '/en/', '/nl/', '/css/site.css', '/css/fonts.css', '/js/routes.js', '/js/i18n.js', '/js/pages.js', '/js/costs.js', '/js/app.js', '/fonts/manrope-latin-wght-normal.woff2', '/fonts/fraunces-latin-wght-normal.woff2', '/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // Supabase, foto's en kaarten gaan rechtstreeks
  const nav = r.mode === 'navigate';
  e.respondWith(fetch(r).then(res => {
    // alleen geslaagde antwoorden bewaren; bij een pagina ook redirects en 404's niet cachen
    if (res.ok && (!nav || !res.redirected)) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || (nav ? caches.match(u.pathname.startsWith('/nl/') ? '/nl/' : '/en/').then(x => x || caches.match('/index.html')) : undefined))));
});
