// Nila app-shell cache v8 (PM row 281 reliability hotfix). Navigations are
// network-first so an installed TV cannot stay stranded on an old shell.
// Lessons from the row-278 incident + checker synthetic repro: cleanup must
// be deterministic POST-TAKEOVER (claim first, then delete retired keys, and
// re-assert on the first fetch this worker serves), a retired worker must
// never recreate its cache, and critical hashed assets are digest-validated
// - bytes that do not match the deploy-stamped digest are never used.
const SHELL = "nila-shell-v8";

// Stamped at deploy time by scripts/deploy-guard (sha256 of the built bytes).
const ASSET_INTEGRITY = {
  "assets/index-1iw5b1kd.js":
    "09a5ae493e678b15365676ecf7027fffd6d2a5da12c9e03feabae0c74d9e79fa",
  "assets/index-CCTeDkKe.css":
    "98e05696b3b222e554767d7d6795f7559689f0fb386ea4efff507babbc9bc5c4",
};

async function cleanupRetired() {
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key !== SHELL).map((key) => caches.delete(key)),
  );
}

async function sha256hex(buffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function integrityKey(url) {
  const path = url.pathname.replace(/^\/(nila-app\/)?/, "");
  return Object.prototype.hasOwnProperty.call(ASSET_INTEGRITY, path)
    ? path
    : null;
}

async function bytesValid(response, key) {
  const hex = await sha256hex(await response.clone().arrayBuffer());
  return hex === ASSET_INTEGRITY[key];
}

// A retired worker (registration.active moved on) must never touch caches:
// no reads it might poison, no writes that could recreate its dead shell.
async function thisWorkerRetired() {
  return self.registration.active !== self;
}

let postTakeoverCleanupDone = false;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(["./", "./index.html"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Deterministic order: take control of every client FIRST (an old
      // worker stops receiving fetch events for claimed tabs, so it cannot
      // re-poison), THEN delete retired caches.
      await self.clients.claim();
      await cleanupRetired();
      postTakeoverCleanupDone = true;
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.includes("/functions/v1/")) return;
  event.respondWith(
    (async () => {
      if (await thisWorkerRetired()) {
        // Superseded worker: network pass-through only, zero cache access.
        return fetch(event.request);
      }
      if (!postTakeoverCleanupDone) {
        // Belt: activate finished without us observing it (e.g. the worker
        // was killed mid-activate) - re-assert retired-cache cleanup before
        // serving anything from cache.
        await cleanupRetired();
        postTakeoverCleanupDone = true;
      }
      if (event.request.mode === "navigate") {
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            const cache = await caches.open(SHELL);
            await cache.put("./index.html", response.clone());
          }
          return response;
        } catch (error) {
          const cached = await caches.match("./index.html");
          if (cached) return cached;
          throw error;
        }
      }
      const key = integrityKey(url);
      const cached = await caches.match(event.request);
      if (cached) {
        if (!key || (await bytesValid(cached, key))) return cached;
        // Poisoned entry: evict and refetch - never served.
        const cache = await caches.open(SHELL);
        await cache.delete(event.request);
      }
      const response = await fetch(event.request);
      if (response.ok && url.pathname.includes("/assets/")) {
        if (key && !(await bytesValid(response, key))) {
          // Served bytes do not match the deploy digest: must not be used.
          return new Response("nila asset integrity failure", {
            status: 502,
          });
        }
        const cache = await caches.open(SHELL);
        await cache.put(event.request, response.clone());
      }
      return response;
    })(),
  );
});
