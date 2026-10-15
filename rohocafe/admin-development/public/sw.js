const CACHE_NAME = "rohocafe-v12";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=12",
  "./app.js?v=12",
  "./catalog.js?v=12",
  "./catalog-sync.js?v=12",
  "./store.js?v=12",
  "./homepage-sync.mjs?v=12",
  "./content-fields.mjs",
  "./manifest.webmanifest",
  "./assets/roho-logo-red.png",
  "./assets/roho-logo-white.png",
  "./assets/hero-cherries-desktop.webp",
  "./assets/hero-cherries-mobile.webp",
  "./assets/roho-001.webp",
  "./assets/icon-192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (new URL(event.request.url).pathname.startsWith("/api/") || new URL(event.request.url).pathname.startsWith("/admin") || new URL(event.request.url).pathname.startsWith("/media/")) return;
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached || caches.match("./index.html"));
      return cached || network;
    }),
  );
});
