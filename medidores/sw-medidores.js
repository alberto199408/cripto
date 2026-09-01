/* Permite instalar MEDIDORES como aplicación y abrirlo aunque no haya internet.
   Los datos del trabajo se guardan aparte, en la memoria del navegador. */
var CACHE="medidores-v1";

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(["./MEDIDORES.html","./manifest-medidores.webmanifest",
                        "./icon-medidores-192.png","./icon-medidores-512.png",
                        "./icon-medidores-512-maskable.png"].map(function(u){
      return c.add(u).catch(function(){});
    }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

/* primero se busca en la red, para que siempre tenga la última versión;
   si no hay internet, se sirve la copia guardada */
self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET") return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var copia=r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request,copia).catch(function(){}); });
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(r){
        return r || caches.match("./MEDIDORES.html");
      });
    })
  );
});
