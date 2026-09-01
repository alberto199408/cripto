/* Hace que la aplicación se pueda instalar y que abra aunque no haya internet.
   Los precios sí necesitan conexión; el portafolio no. */
var CACHE="portafolio-v8";   /* archivo: sw-portafolio.js, dentro de la carpeta portafolio */

/* Este ayudante manda SOLO sobre los archivos de su propia carpeta.
   Si hay otras aplicaciones en subcarpetas (medidores, horario...), no
   se mete con ellas: antes las interceptaba y les servía CRIPTO. */
function esMio(url){
  try{
    var base=new URL("./", self.registration.scope).pathname;   /* mi carpeta */
    var p=new URL(url).pathname;
    if(p.indexOf(base)!==0) return false;
    return p.slice(base.length).indexOf("/")<0;   /* nada de subcarpetas */
  }catch(e){ return false; }
}

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(["./CRIPTO.html","./manifest.webmanifest",
                        "./icon-192.png","./icon-512.png","./icon-512-maskable.png"].map(function(u){
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
  if(!esMio(u)) return;                    /* de otra aplicación: no lo toco */
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
