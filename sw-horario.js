/* Guarda el programa en el teléfono: abre aunque no haya internet. */
var CACHE="horario-v2";
self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(["./HORARIO.html","./manifest-horario.webmanifest"].map(function(u){
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
  if(e.request.method!=="GET" || u.indexOf("api.")>=0 || u.indexOf("github")>=0) return;
  e.respondWith(fetch(e.request).then(function(r){
    var c2=r.clone();
    caches.open(CACHE).then(function(c){ c.put(e.request,c2).catch(function(){}); });
    return r;
  }).catch(function(){
    return caches.match(e.request).then(function(r){ return r || caches.match("./HORARIO.html"); });
  }));
});
