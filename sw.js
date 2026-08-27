/* Hace que la aplicación se pueda instalar y que abra aunque no haya internet.
   Los precios sí necesitan conexión; el portafolio no. */
var CACHE="portafolio-v7";

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(["./CRIPTO.html","./manifest.webmanifest"].map(function(u){
      return c.add(u).catch(function(){});
    }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var u=e.request.url;
  if(e.request.method!=="GET" || u.indexOf("api.")>=0 || u.indexOf("github.com")>=0) return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var copia=r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request,copia).catch(function(){}); });
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(r){
        return r || caches.match("./CRIPTO.html");
      });
    })
  );
});
