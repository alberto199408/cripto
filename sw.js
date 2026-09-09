/* =====================================================================
   AYUDANTE DEL PORTAFOLIO CRIPTO  ·  sw.js
   Va en la raíz del repositorio, junto a CRIPTO.html.

   Qué hace: guarda una copia de la página para que el teléfono abra sin
   internet, PERO cuando hay internet siempre pregunta primero por la
   versión nueva. Así, en cuanto usted sube un CRIPTO.html nuevo, el
   teléfono lo toma solo la próxima vez que lo abra. Ya no hay que borrar
   datos del sitio ni reinstalar nada.
   ===================================================================== */

var CACHE   = "cripto-v9";
var ESPERA  = 3500;   /* si internet tarda más que esto, se usa lo guardado */
var ARCHIVOS = ["./", "./CRIPTO.html", "./manifest.webmanifest"];

self.addEventListener("install", function(e){
  /* OJO: aquí NO se hace skipWaiting. Si la versión nueva entrara de golpe,
     la página se recargaría sola y usted perdería lo que estuviera escribiendo.
     Se queda esperando, la página le avisa, y entra cuando usted pulse
     "Actualizar ahora" (o la próxima vez que abra la aplicación de cero). */
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(ARCHIVOS.map(function(u){
        /* cache:"reload" = pedirlo a internet de verdad, no a la caché del navegador */
        return c.add(new Request(u, {cache:"reload"})).catch(function(){});
      }));
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){
        if(k !== CACHE) return caches.delete(k);   /* fuera lo viejo */
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* primero internet, y si no contesta, lo guardado */
function deInternet(req){
  return new Promise(function(ok, mal){
    var listo=false;
    var t=setTimeout(function(){ if(!listo){ listo=true; mal(new Error("tardó")); } }, ESPERA);
    fetch(req).then(function(r){
      if(listo) return;
      listo=true; clearTimeout(t);
      if(r && r.ok && (r.type==="basic" || r.type==="default")){
        var copia=r.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copia); }).catch(function(){});
      }
      ok(r);
    }).catch(function(e){
      if(listo) return;
      listo=true; clearTimeout(t); mal(e);
    });
  });
}

self.addEventListener("fetch", function(e){
  var req=e.request;
  if(req.method !== "GET") return;

  var url;
  try{ url=new URL(req.url); }catch(x){ return; }

  /* los precios y GitHub van derecho a internet, sin pasar por aquí */
  if(url.origin !== self.location.origin) return;

  function deLoGuardado(respuesta){
    return caches.match(req).then(function(c){
      if(c) return c;
      /* si pedía una página, se le devuelve la aplicación guardada */
      if(req.mode === "navigate")
        return caches.match("./CRIPTO.html").then(function(x){
          return x || respuesta || new Response("", {status:504, statusText:"sin internet"});
        });
      return respuesta || new Response("", {status:504, statusText:"sin internet"});
    });
  }

  e.respondWith(
    deInternet(req).then(function(r){
      /* que el servidor conteste no quiere decir que conteste bien: un 500 o un
         503 también tiene que caer en lo guardado */
      if(r && r.ok) return r;
      return deLoGuardado(r);
    }).catch(function(){ return deLoGuardado(null); })
  );
});

/* la página puede pedir que la versión nueva entre ya */
self.addEventListener("message", function(e){
  if(e.data && e.data.tipo === "actualizar") self.skipWaiting();
});
