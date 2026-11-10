// Service worker of the agents' tablet app (/agjent): the app keeps working without internet.
// - the page itself: network first, cached copy when offline
// - Next.js scripts/styles/fonts: cache first (their file names change on every deploy)
// - product photos and brand logos: cache first, filled as they are viewed or via "Shkarko fotot"
// - /agjent/api/*: never cached — the app queues its work and syncs when online.
const VERSION = "fk-agent-v1";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const IMAGES = `${VERSION}-images`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.addAll(["/agjent", "/agjent.webmanifest", "/brand/mark.png", "/brand/icon-180.png", "/brand/icon-512.png"]))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isImage = (req, url) =>
  req.destination === "image" || url.pathname.startsWith("/api/media/file/") || url.hostname.endsWith("supabase.co") || url.pathname.startsWith("/brand/");

async function cacheFirst(cacheName, req) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === "opaque") cache.put(req, res.clone());
    return res;
  } catch (err) {
    return hit || Response.error();
  }
}

async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put("/agjent", res.clone());
    return res;
  } catch (err) {
    return (await cache.match("/agjent")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/agjent/api/") || url.pathname.startsWith("/api/users")) return;
  if (req.mode === "navigate" && url.pathname.startsWith("/agjent")) return event.respondWith(networkFirst(req));
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) return event.respondWith(cacheFirst(STATIC, req));
  if (isImage(req, url)) return event.respondWith(cacheFirst(IMAGES, req));
});
