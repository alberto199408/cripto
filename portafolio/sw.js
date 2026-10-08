/* =====================================================================
   AYUDANTE DEL TELÉFONO · Mi Portafolio Cripto v33
   Guarda el programa para que abra sin internet y, cuando usted publica
   una versión nueva, la trae solo la próxima vez que lo abra con internet.
   ===================================================================== */
var CAJA = "cripto-v38";
var ARCHIVOS = ["./", "./index.html", "./CRIPTO.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png", "./icono-mask-192.png", "./icono-mask-512.png", "./privacidad.html"];

/* OJO, AQUÍ ESTABA EL FALLO DE «SUBO Y NO SE ACTUALIZA»:
   GitHub manda sus archivos con «guárdalos 10 minutos» (max-age=600). Si el
   ayudante nuevo los pedía normal, el navegador le daba la copia VIEJA de su
   propio almacén y el ayudante la guardaba en su caja nueva. A partir de ahí
   la caja nueva tenía el programa viejo dentro y ya no se arreglaba solo.
   Con cache:"reload" se obliga a pedirlos a GitHub de verdad. */
function pedirDeVerdad(u){ return new Request(u, {cache:"reload"}); }

self.addEventListener("install", function (ev) {
  self.skipWaiting();                 /* el ayudante nuevo manda ya, sin esperar */
  ev.waitUntil(
    caches.open(CAJA).then(function (c) {
      return Promise.all(ARCHIVOS.map(function (u) {
        return fetch(pedirDeVerdad(u)).then(function (r) {
          if (r && r.ok) return c.put(u, r);
        }).catch(function () { /* si falta alguno, no se cae */ });
      }));
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

  /* el programa y sus piezas se piden SIEMPRE a GitHub, sin pasar por el
     almacén del navegador: si no, una copia de hace diez minutos tapa la
     versión que usted acaba de publicar */
  var p = url.pathname;
  var esPrograma = /\.(html|js|webmanifest)$/.test(p) || p.endsWith("/");
  var pedir = esPrograma ? new Request(req.url, {cache:"no-store"}) : req;

  ev.respondWith(
    fetch(pedir).then(function (r) {
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

/* =====================================================================
   AVISOS CON LA APLICACIÓN CERRADA
   Cuando el vigilante de precios manda un aviso, el teléfono despierta
   este ayudante aunque la aplicación esté cerrada. Aquí se muestra la
   notificación y, si la persona la toca, se abre el programa.
   ===================================================================== */
self.addEventListener("push", function (ev) {
  var d = {};
  try { d = ev.data ? ev.data.json() : {}; } catch (e) {
    try { d = { cuerpo: ev.data.text() }; } catch (e2) { d = {}; }
  }
  var n = d.notification || d;
  var titulo = n.title || n.titulo || "Mi Portafolio Cripto";
  var cuerpo = n.body || n.cuerpo || "";
  ev.waitUntil(self.registration.showNotification(titulo, {
    body: cuerpo,
    icon: "./icono-192.png",
    badge: "./icono-192.png",
    tag: (d.data && d.data.tag) || n.tag || ("aviso-" + Date.now()),
    vibrate: [220, 90, 220],
    data: { ir: (d.data && d.data.ir) || n.ir || "alr" },
    requireInteraction: false
  }));
});

self.addEventListener("notificationclick", function (ev) {
  ev.notification.close();
  var ir = (ev.notification.data && ev.notification.data.ir) || "alr";
  ev.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (l) {
      for (var i = 0; i < l.length; i++) {
        if (l[i].url.indexOf("CRIPTO.html") >= 0 && "focus" in l[i]) {
          l[i].postMessage({ tipo: "irA", vista: ir });
          return l[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow("./CRIPTO.html#" + ir);
    })
  );
});
