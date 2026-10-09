/* =====================================================================
   AYUDANTE DEL TELÉFONO · Mi Portafolio Cripto v43
   Guarda el programa para que abra sin internet y, cuando usted publica
   una versión nueva, la trae solo la próxima vez que lo abra con internet.

   ---------------------------------------------------------------------
   v42 · POR QUÉ SE QUEDABA COLGADO EN LA PANTALLA AZUL
   Luis mandó la foto: el teléfono parado en el arranque, sin pasar de ahí.
   No era la cuenta borrada. Era esto:

   Hasta la v41 este ayudante pedía el programa SIEMPRE a internet antes de
   enseñar nada («primero internet, y si no hay, lo guardado»). El programa
   pesa 3,8 MB. O sea que cada vez que usted abría la aplicación:

     · se bajaba 3,8 MB enteros, aunque ya los tuviera guardados,
     · y la pantalla de arranque se quedaba puesta hasta que terminara.

   Con buen wifi son unos segundos y molesta. Con datos del teléfono son
   minutos. Y si la conexión está medio muerta —el teléfono dice que hay
   internet pero no pasa nada, que es justo lo que ocurre al volver de la
   ventana de Google o al despertar el teléfono— esa petición NO falla:
   se queda esperando. Como no falla, nunca se llegaba al «y si no hay,
   lo guardado». La pantalla de arranque se quedaba ahí para siempre.

   Ahora es al revés y con reloj:
     · el programa se sirve de lo guardado AL INSTANTE: abre siempre, con
       internet o sin él, rápido y sin gastar datos;
     · por detrás se pregunta en 2 kB si hay una versión nueva publicada,
       y solo entonces se baja el programa entero;
     · y ninguna petición puede tener la pantalla parada más de 8 segundos.
   ===================================================================== */
var VER = "43";
var CAJA = "cripto-v43";
var ARRANQUE = "./CRIPTO.html";
var ARCHIVOS = ["./", "./index.html", "./CRIPTO.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png", "./icono-mask-192.png", "./icono-mask-512.png", "./privacidad.html"];
var ESPERA = 8000;          /* lo máximo que internet puede tener la pantalla parada */
var MARCA = "./__version__";  /* apunte interno, no es un archivo de verdad */

/* OJO, AQUÍ ESTABA EL FALLO DE «SUBO Y NO SE ACTUALIZA»:
   GitHub manda sus archivos con «guárdalos 10 minutos» (max-age=600). Si el
   ayudante nuevo los pedía normal, el navegador le daba la copia VIEJA de su
   propio almacén y el ayudante la guardaba en su caja nueva. A partir de ahí
   la caja nueva tenía el programa viejo dentro y ya no se arreglaba solo.
   Con cache:"reload" se obliga a pedirlos a GitHub de verdad. */
function pedirDeVerdad(u){ return new Request(u, {cache:"reload"}); }

/* una promesa con reloj: si tarda más de la cuenta, se da por fallada.
   Sin esto, una conexión medio muerta deja la pantalla parada sin fin. */
function conTope(p, ms){
  return new Promise(function(suelta, falla){
    var t = setTimeout(function(){ falla(new Error("tardó demasiado")); }, ms);
    p.then(function(r){ clearTimeout(t); suelta(r); },
           function(e){ clearTimeout(t); falla(e); });
  });
}

self.addEventListener("install", function (ev) {
  self.skipWaiting();                 /* el ayudante nuevo manda ya, sin esperar */
  ev.waitUntil(
    caches.open(CAJA).then(function (c) {
      return Promise.all(ARCHIVOS.map(function (u) {
        return fetch(pedirDeVerdad(u)).then(function (r) {
          if (r && r.ok) return c.put(u, r);
        }).catch(function () { /* si falta alguno, no se cae */ });
      })).then(function(){
        return c.put(MARCA, new Response(VER));
      });
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

/* ---------------------------------------------------------------------
   ¿HAY VERSIÓN NUEVA? — preguntado en 2 kB, no en 3,8 MB
   El programa lleva la versión escrita en la cabecera, en los primeros
   bytes del archivo. Se piden solo esos. Si el sitio sabe mandar trozos
   (GitHub sabe) manda 2 kB y ya; y si no sabe y manda todo, se corta la
   bajada en cuanto llega el primer trozo. En los dos casos se gastan
   unos pocos kB en vez de 3,8 MB.
   --------------------------------------------------------------------- */
function soloElPrincipio(r){
  if (!r || !r.body || !r.body.getReader) return r.text();
  var lector = r.body.getReader(), trozos = [], n = 0;
  return (function tirar(){
    return lector.read().then(function (p) {
      if (p.done) return;
      trozos.push(p.value); n += p.value.length;
      if (n >= 2048) { try { lector.cancel(); } catch (e) {} return; }
      return tirar();
    });
  })().then(function () {
    var u = new Uint8Array(n), i = 0;
    trozos.forEach(function (t) { u.set(t, i); i += t.length; });
    return new TextDecoder().decode(u);
  });
}
function versionPublicada(){
  return conTope(fetch(new Request(ARRANQUE, {
    cache: "no-store", headers: { Range: "bytes=0-2047" }
  })).then(soloElPrincipio).then(function (txt) {
    var m = String(txt).match(/name="v"\s+content="([^"]+)"/);
    return m ? m[1] : "";
  }), ESPERA);
}
/* se baja el programa entero y se guarda, pero POR DETRÁS: la pantalla
   ya está puesta y el usuario no espera por esto */
function traerseLoNuevo(){
  return caches.open(CAJA).then(function (c) {
    return Promise.all(ARCHIVOS.map(function (u) {
      return fetch(pedirDeVerdad(u)).then(function (r) {
        if (r && r.ok) return c.put(u, r);
      }).catch(function () {});
    }));
  });
}
/* una sola vez cada diez minutos como mucho, y una sola a la vez */
var repaso = null, repasoHasta = 0;
function repasar(){
  if (repaso || Date.now() < repasoHasta) return;
  repaso = versionPublicada().then(function (hay) {
    if (!hay || hay === VER) return;
    return traerseLoNuevo();
  }).catch(function () {}).then(function () {
    repaso = null; repasoHasta = Date.now() + 600000;
  });
}

/* ---------------------------------------------------------------------
   LO QUE SE SIRVE
   El programa: lo guardado al instante (abre siempre, gratis y rápido).
   Lo demás (precios, logos): internet, y si no hay, lo guardado.
   --------------------------------------------------------------------- */
self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;
  /* v42 · una petición por trozos («dame solo los primeros 2 kB») se deja
     pasar tal cual. Si la tocamos aquí se pierde la cabecera Range y el
     navegador acaba bajándose el archivo entero: justo lo que se quería
     evitar al preguntar la versión. */
  if (req.headers && req.headers.get && req.headers.get("range")) return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== location.origin) return;

  var p = url.pathname;
  var esPrograma = /\.(html|js|webmanifest)$/.test(p) || p.endsWith("/");

  if (esPrograma) {
    ev.respondWith(
      caches.match(req).then(function (guardado) {
        if (guardado) {
          /* ya está: se enseña ahora mismo. Si hay versión nueva publicada,
             se la trae por detrás y entrará la próxima vez que abra. */
          ev.waitUntil(Promise.resolve().then(repasar));
          return guardado;
        }
        /* la primerísima vez, o si se perdió lo guardado: a internet, pero
           con reloj, para no dejar la pantalla parada si no contesta */
        return conTope(fetch(new Request(req.url, { cache: "no-store" })), ESPERA)
          .then(function (r) {
            if (r && r.ok) {
              var copia = r.clone();
              ev.waitUntil(caches.open(CAJA).then(function (c) { return c.put(req, copia); }));
            }
            return r;
          })
          .catch(function () {
            return caches.match(ARRANQUE).then(function (c) {
              return c || new Response(
                "<!doctype html><meta charset=utf-8><title>Sin internet</title>" +
                "<body style='background:#0A1420;color:#E6EDF3;font:16px system-ui;" +
                "display:grid;place-items:center;height:100vh;margin:0;text-align:center'>" +
                "<div><p>No se pudo abrir el programa.</p>" +
                "<p style='opacity:.7'>Conéctese a internet una vez y quedará guardado " +
                "para abrirlo siempre, con internet o sin él.</p></div>",
                { headers: { "Content-Type": "text/html; charset=utf-8" } });
            });
          });
      })
    );
    return;
  }

  ev.respondWith(
    fetch(req).then(function (r) {
      if (r && r.ok) {
        var copia = r.clone();
        ev.waitUntil(caches.open(CAJA).then(function (c) { return c.put(req, copia); }));
      }
      return r;
    }).catch(function () {
      return caches.match(req).then(function (c) {
        return c || Response.error();
      });
    })
  );
});

/* cuando usted pulsa "Actualizar ahora" en el aviso */
self.addEventListener("message", function (ev) {
  if (ev.data && ev.data.tipo === "actualizar") self.skipWaiting();
  /* y cuando el programa quiere comprobar ya mismo si hay versión nueva */
  if (ev.data && ev.data.tipo === "repasar") { repasoHasta = 0; repasar(); }
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
