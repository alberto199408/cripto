/* =====================================================================
   AYUDANTE DE RETIRO  —  va en la RAÍZ, con el nombre sw.js
   Reemplaza al sw.js anterior, que mandaba sobre toda la zona /cripto/
   e interfería con Medidores y Horario.
   Este no hace nada: se borra a sí mismo y limpia solo SUS copias.
   No toca los datos guardados ni las otras aplicaciones.
   Cuando ya no aparezca ninguna aplicación rara, puede borrar este
   archivo del repositorio.
   ===================================================================== */
self.addEventListener("install", function(){ self.skipWaiting(); });

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      /* SOLO las copias del portafolio: las de medidores y horario se respetan */
      return Promise.all(ks.filter(function(k){ return k.indexOf("portafolio")===0; })
                           .map(function(k){ return caches.delete(k); }));
    }).then(function(){
      return self.registration.unregister();      /* se da de baja */
    }).then(function(){
      return self.clients.matchAll({type:"window"});
    }).then(function(cs){
      cs.forEach(function(c){ try{ c.navigate(c.url); }catch(e){} });
    }).catch(function(){})
  );
});
/* sin manejador de fetch: no intercepta ni una sola petición */
