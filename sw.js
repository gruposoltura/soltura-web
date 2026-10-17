// Grupo Soltura website - service worker.
// Netwerk eerst (altijd de nieuwste versie en het actuele aanbod); de cache is alleen een vangnet bij geen verbinding.
const V = 'soltura-v1';
const SHELL = ['./', 'index.html', 'css/site.css', 'css/fonts.css', 'js/i18n.js', 'js/pages.js', 'js/app.js', 'fonts/manrope-latin-wght-normal.woff2', 'fonts/fraunces-latin-wght-normal.woff2', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // Supabase, foto's en kaarten gaan rechtstreeks
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
