/* =====================================================================
   AYUDANTE DEL TELÉFONO · Portafolio Cripto v11
   Guarda el programa para que abra sin internet y, cuando usted publica
   una versión nueva, la trae solo la próxima vez que lo abra con internet.
   ===================================================================== */
var CAJA = "cripto-v13";
var ARCHIVOS = ["./", "./CRIPTO.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png", "./icono-mask-192.png", "./icono-mask-512.png"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(CAJA).then(function (c) {
      return c.addAll(ARCHIVOS).catch(function () { /* si falta alguno, no se cae */ });
    })
  );
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        if (k !== CAJA) return caches.delete(k);   /* se botan las cajas viejas */
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* El programa: primero internet (para traer la versión nueva), y si no hay,
   lo guardado. Todo lo demás (precios, GitHub) va siempre a internet. */
self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== location.origin) return;

  ev.respondWith(
    fetch(req).then(function (r) {
      if (r && r.ok) {
        var copia = r.clone();
        caches.open(CAJA).then(function (c) { c.put(req, copia); });
      }
      return r;
    }).catch(function () {
      return caches.match(req).then(function (c) {
        return c || caches.match("./CRIPTO.html");
      });
    })
  );
});

/* cuando usted pulsa "Actualizar ahora" en el aviso */
self.addEventListener("message", function (ev) {
  if (ev.data && ev.data.tipo === "actualizar") self.skipWaiting();
});
