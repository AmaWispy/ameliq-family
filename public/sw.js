const CACHE_NAME = 'ameliq-family-v1';
const ASSETS_TO_CACHE = [
    '/logo.png',
    '/site.webmanifest'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Стратегия Network First (сначала сеть, потом кэш)
    // Это критично для Inertia.js и CSRF токенов
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
