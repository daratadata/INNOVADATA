/* InnovaData — Service Worker
   Met en cache l'essentiel de la page pour qu'elle s'ouvre même hors connexion,
   et remplit la condition technique qui permet au navigateur de proposer
   l'installation. Incrémentez CACHE_NAME à chaque mise en ligne importante
   pour forcer la mise à jour du cache chez les visiteurs. */
const CACHE_NAME = 'innovadata-site-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Réseau d'abord (toujours la dernière version du site), secours sur le
   cache si la connexion est coupée. */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/index.html')))
  );
});
