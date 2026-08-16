// KC section service worker — caches survival pages so they load offline.
// Scope: /kc/, /es/kc/. Strategy: cache-on-first-load + network-with-fallback.

const CACHE_VERSION = "kc-cache-v1";
const PRECACHE_URLS = [
    "/kc/crisis",
    "/kc/crisis.txt",
    "/kc/crisis.json",
    "/kc/newcomers",
    "/kc/food",
    "/kc/housing",
    "/kc/healthcare",
    "/kc/legal",
    "/es/kc/crisis",
    "/es/kc/newcomers",
    "/es/kc/food",
    "/es/kc/housing",
    "/es/kc/healthcare",
    "/es/kc/legal"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {
            // Best-effort — some pages may not exist yet in dev.
            return Promise.resolve();
        }))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (!url.pathname.startsWith("/kc/") && !url.pathname.startsWith("/es/kc/")) return;
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(event.request).then((cached) => cached || caches.match("/kc/crisis"))
            )
    );
});
