const CACHE = "mughis-v1";
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("api-inference.huggingface.co") || e.request.url.includes("pollinations") || e.request.url.includes("replicate")) {
    e.respondWith(networkFirst(e.request));
  } else {
    e.respondWith(cacheFirst(e.request));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  return cached || fetch(req).then((res) => {
    const clone = res.clone();
    caches.open(CACHE).then((c) => c.put(req, clone));
    return res;
  });
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const clone = res.clone();
    caches.open(CACHE).then((c) => c.put(req, clone));
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response("Offline", { status: 503 });
  }
}

self.addEventListener("sync", (e) => {
  if (e.tag === "sync-queue") {
    e.waitUntil(processQueue());
  }
});

async function processQueue() {
  const cache = await caches.open(CACHE);
  const requests = await cache.match("queue");
  if (!requests) return;
  const queue = await requests.json();
  for (const item of queue) {
    try {
      await fetch(item.url, { method: "POST", body: JSON.stringify(item.data), headers: { "Content-Type": "application/json" } });
    } catch {}
  }
  await cache.put("queue", new Response(JSON.stringify([])));
});
