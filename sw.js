// LifeOS service worker: offline app shell; the vault is fetched network-first.
const V = 'lifeos-v7';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'meals.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('data.enc.json')) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('data.enc.json', c)); return r; }).catch(() => caches.match('data.enc.json')));
    return;
  }
  // stale-while-revalidate for the shell
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
