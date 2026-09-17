// nila-app shell service worker - v14 (shell-redirect poisoning fix; v11 history below)
// v14: never cache or serve "./index.html" - Pages 308-redirects it to "./" and
// cache.addAll stores the REDIRECTED response. Chrome refuses a redirected response
// for navigation respondWith -> every controlled navigation fails ERR_FAILED
// (founder "app broken in several ways", 2026-09-16 22:27). v14 caches and serves
// only "./" and treats any redirected cached entry as poison.
// VERSION MUST EXCEED the highest deployed shell: production currently serves
// v11-class code stamped v13 (deploy-time bumps) - v12 would self-retire against
// existing v13 client caches (newerShellExists) and v13 would collide with the
// poisoned cache name and skip eviction. v14 activates cleanly and its
// cleanupRetired evicts every retired poisoned cache (v11..v13).
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
const VERSION = 14;
const SHELL = `nila-shell-v${VERSION}`;

// Exact sha256 digests for the currently served hashed assets, filled by
// scripts/deploy-guard/integrity.mjs at deploy time. The marker lives INSIDE
// the placeholder block so stamping consumes it; a raw build keeps it and
// can never pass the deploy guard (verify-deploy tier S, stage-deploy stamp).
const ASSET_INTEGRITY = {
  "assets/index-C4NgHN-T.js":
    "f62b7274e8788d60777b46dc25e96554aca7a5b0c0252c9fd4d3cce783ae7407",
  "assets/index-DBZcojcV.css":
    "59b769dfe268227a21482eb55091d2ff40074c70fc7674112a4a123a9294ba75",
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
      await cache.addAll(["./"]); // never "./index.html" - Pages 308-redirects it; a redirected shell response kills navigations
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
    if (cached.redirected) {
      await cache.delete(event.request); // redirected entries are poison - never serve
    } else if (!key || (await bytesValid(cached, key))) {
      return cached;
    } else {
      await cache.delete(event.request); // exact bad entry deleted
    }
  }
  const response = await fetch(event.request);
  if (!response.ok) return response;
  if (response.redirected) return response; // never cache a redirected response
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
        const shell = await cache.match("./");
        if (shell && !shell.redirected) return shell;
        if (shell) await cache.delete("./"); // redirected shell is poison - never serve it
        // Normalize the network side too: a navigation to /nila-app/index.html
        // fetched as-is follows the Pages 308 and yields a redirected response -
        // the same respondWith failure class. Always fetch the canonical shell.
        return fetch(new URL("./", self.location).href);
      }
      return serveAsset(event, url, integrityKey(url));
    })(),
  );
});
