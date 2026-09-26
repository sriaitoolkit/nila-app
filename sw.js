// nila-app shell service worker - v24 (hotfix train item 6c: welcome short-landscape hero-fit fold + synthetic gate fixtures; v23 item 6b phone clamp; v22 item 6a colour-mix tiles asset-only, sw untouched; v21 item 2 shelf TV layout + picker two-up; v20 item 3 picker uniform; v19 item 1 worldpick; v11 lineage below)
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
const VERSION = 24;
const SHELL = `nila-shell-v${VERSION}`;

const ASSET_INTEGRITY = {
  "parent/assets/index-kwUp9Hla.js":
    "729eeaf5b87b7e02a443e178ce871e5d7cef4ffef8cb50f24a4c7d3a84887446",
  "parent/assets/index-CetFmaHH.css":
    "087500b661869c96de6c59ee50b91d2ac54eedad4599ec9557f3d40d91055b18",
  "assets/index-Ds3tCgQL.js":
    "b573205b95c08b06d66c05b1a0bbf5d1520a08f8f697ba9b545b6e73fed64479",
  "assets/index-CGf7wccC.css":
    "88a9c28b34f64cdeb33bfac90ee10c4b436fb12d933b0b0cdc526151d800bbda",
  "assets/index-C2b9OMS2.js":
    "ca9b3533d27c171e7d74e035b3b32cc920027ac5b6fddba02820a254cf5af98a",
  "assets/index-FA-oVFNu.css":
    "d9809775997699a5d54da51b9d6f4afa3afb9edc51a199bc4cf8cf5923bf8ac3",
  "assets/index-L6EyOWGv.js":
    "ffa5531b0a619c44f034c59e171dac0bbfecbfd97d0ae6ffbbaf9464f94ddc71",
  "assets/index-BtQLX5oM.css":
    "3bdf39bfd675e23090893f89f9f9177fc0ac9b436b048027f0aa29216070372e",
  "assets/index-CLp7L6eg.js":
    "1f6bc20eee89ba135c36ab09c055c87bd82ffb95f4d357109d7edc2083a76135",
  "assets/index-DmaEiXvu.css":
    "fe80f0abe2a3c49ccf09bd3c56012e34f3bff2d5f414caf666b347a7d19f59d8",
  "assets/index-D8V6FmVi.js":
    "b9fee9a3b14b43da2af85188b7c60de3821ca85baaa05edec97c42d879a29bf4",
  "assets/index-DVZbX9KG.css":
    "d044f92c6d9af34183399dc139226875fe56d6432644e2d0b9d103f2e7ac0ae6",
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
      // P1 boot-blank work order (PM admission 2026-09-26 05:00 IST): preview
      // navigations pass straight to network. The navigate branch below serves
      // the prod shell for EVERY in-scope navigation, which made previews and
      // the preview-scoped diag page unreachable on prod-carrying clients.
      if (event.request.mode === "navigate" && url.pathname.startsWith("/nila-app/preview/")) {
        return fetch(event.request);
      }
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

