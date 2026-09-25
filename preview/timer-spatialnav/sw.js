// nila-app shell service worker - v11 (PICKER-fix v1.2 deploy bump; v9 fixes below)
// Fixes the v8 launch blockers found by test-eng + the local swlab harness:
//  - v8's retired check compared registration.active to self (the global
//    scope) - ALWAYS true, so v8 passed every fetch to the network and never
//    claimed, cleaned, or repaired anything. v9 gates on an activation flag
//    plus a monotonic shell-version census: any newer nila-shell-vN cache
//    means this worker lost and passes through with zero cache access.
//  - cache repair is now provable: bad entry deleted, network bytes
//    validated, verified clone recached, then READ BACK and re-hashed.
//  - shell reads are scoped to the ACTIVE shell cache only, so a recreated
//    retired cache (page or old worker) can never serve bytes.
//  - retired-cache cleanup re-runs on navigations only when the census is
//    dirty (bounded: one keys() call per navigation once healthy).
const VERSION = 13;
const SHELL = `nila-shell-v${VERSION}`;

// DEPLOY-GUARD STAMP REQUIRED: exact sha256 digests for the currently served
// hashed assets, filled by scripts/deploy-guard/integrity.mjs at deploy time.
const ASSET_INTEGRITY = {
  "assets/index-Kpv6RYuF.js":
    "9be68742ecf16fb318dcdbfa5efa17dd2118ca98be51081b35ae58d3d3f38913",
  "assets/index-Cz6Cl8BG.css":
    "f5afc44d800b51e98a59c113336bb781560c5412aa3b94307834eb697b4e5e8f",
  "parent/assets/index-kwUp9Hla.js":
    "729eeaf5b87b7e02a443e178ce871e5d7cef4ffef8cb50f24a4c7d3a84887446",
  "parent/assets/index-CetFmaHH.css":
    "087500b661869c96de6c59ee50b91d2ac54eedad4599ec9557f3d40d91055b18",
};

function shellVersion(key) {
  const m = /^nila-shell-v(\d+)$/.exec(key);
  return m ? Number(m[1]) : 0;
}
async function newerShellExists() {
  return (await caches.keys()).some((k) => shellVersion(k) > VERSION);
}
async function sha256Hex(buf) {
  const d = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function bytesValid(response, key) {
  const expected = ASSET_INTEGRITY[key];
  if (!expected) return true;
  return (await sha256Hex(await response.clone().arrayBuffer())) === expected;
}
function integrityKey(url) {
  const path = url.pathname.replace(/^\/nila-app\//, "");
  return Object.prototype.hasOwnProperty.call(ASSET_INTEGRITY, path) ? path : null;
}
async function cleanupRetired() {
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((k) => shellVersion(k) > 0 && k !== SHELL).map((k) => caches.delete(k)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await cache.addAll(["./", "./index.html"]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (await newerShellExists()) return; // a newer worker is taking over
      await self.clients.claim();
      await cleanupRetired();
    })(),
  );
});

async function serveAsset(event, url, key) {
  const cache = await caches.open(SHELL); // ACTIVE shell only - never caches.match
  const cached = await cache.match(event.request);
  if (cached) {
    if (!key || (await bytesValid(cached, key))) return cached;
    await cache.delete(event.request); // exact bad entry deleted
  }
  const response = await fetch(event.request);
  if (!response.ok) return response;
  if (!url.pathname.includes("/assets/")) return response;
  if (key && !(await bytesValid(response, key))) {
    return new Response("nila asset failed integrity validation", { status: 502 });
  }
  // Recache a verified clone, then READ BACK and re-hash to prove the write
  // landed before the event is allowed to finish.
  await cache.put(event.request, response.clone());
  const written = await cache.match(event.request);
  if (!written || (key && !(await bytesValid(written, key)))) {
    await cache.delete(event.request);
    return new Response("nila asset cache write failed verification", { status: 502 });
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      // Retired pass-through: only when a newer worker is actually in the
      // pipeline AND has already built its shell. A lone future-version cache
      // (page-created) is dirty census, not a takeover - we keep serving and
      // the next navigation's cleanup removes it.
      if (
        (self.registration.installing || self.registration.waiting) &&
        (await newerShellExists())
      ) {
        return fetch(event.request);
      }
      if (event.request.mode === "navigate") {
        // Bounded late-recreation defense: only touch caches when the census
        // is dirty; a healthy census costs one keys() call per navigation.
        event.waitUntil(
          (async () => {
            const keys = await caches.keys();
            if (keys.some((k) => shellVersion(k) > 0 && k !== SHELL)) {
              await cleanupRetired();
            }
          })(),
        );
        const cache = await caches.open(SHELL);
        return (await cache.match("./index.html")) || fetch(event.request);
      }
      return serveAsset(event, url, integrityKey(url));
    })(),
  );
});
