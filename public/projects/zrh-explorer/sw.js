const CACHE = "zrh-explorer-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./locations.json",
  "./manifest.json",
  "./icon.svg",
  "./icon.svg?v=1",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  // locations.json: network-first so updates are picked up live, cache as fallback
  if (e.request.url.endsWith("locations.json")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)),
    );
    return;
  }

  // Everything else: cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      });
    }),
  );
});
