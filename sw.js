// Service worker : garde l'enveloppe de l'appli (pas les données) pour un démarrage instantané.
// Les données viennent toujours de Supabase, jamais du cache.
const VERSION = "v1.4.0";
const FICHIERS = ["./", "index.html", "dashboard-modele.html", "icon.svg", "manifest.webmanifest"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHIERS))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Supabase et CDN : réseau direct
  // d'abord le réseau (pour avoir la dernière version), le cache en secours hors connexion
  e.respondWith(fetch(e.request).then((r) => { const copie = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copie)); return r; })
    .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
