const CACHE_NAME = "lista-tareas-cache-v2";
const ARCHIVOS_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/api/tareas"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const peticion = event.request;
  const url = new URL(peticion.url);

  // Ignorar peticiones que no sean GET del mismo origen (ej. extensiones del navegador)
  if (peticion.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const respuestaCache = await caches.match(peticion);

      const promesaRed = fetch(peticion)
        .then((respuestaRed) => {
          if (respuestaRed && respuestaRed.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(peticion, respuestaRed.clone()));
          }
          return respuestaRed;
        })
        .catch(() => null);

      if (respuestaCache) {
        return respuestaCache;
      }

      const respuestaRed = await promesaRed;
      if (respuestaRed) {
        return respuestaRed;
      }

      if (peticion.mode === "navigate") {
        const paginaInicio = await caches.match("/index.html");
        if (paginaInicio) return paginaInicio;
      }

      return new Response(JSON.stringify({ error: "Sin conexion y sin datos en cache" }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    })()
  );
});
