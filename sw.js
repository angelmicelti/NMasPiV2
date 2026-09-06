// Service Worker para nmaspi.html (app de archivo ÚNICO)
// Estrategia: network-first para navegación (HTML), cache-first para el resto de
// assets estáticos, con actualización en segundo plano.
//
// IMPORTANTE (v2.13): la precarga inicial solo incluye el archivo REAL de la app
// (nmaspi.html). La lista antigua (index.html, app.js, styles.css, manifest.json,
// icon-*.png) apuntaba a ficheros que NO existen en el despliegue: cache.addAll()
// fallaba, el evento install terminaba en error y el SW nunca llegaba a activarse
// (sin PWA offline y sin caché). Además, la instalación ahora es RESILIENTE: si
// algún asset falla, se precachea el resto en vez de abortar todo.
//
// Al publicar una versión nueva de la app: sube CACHE_NAME al mismo número de
// APP_VERSION de nmaspi.html. La activación borra las cachés antiguas y
// skipWaiting()+clients.claim() ponen la versión nueva en marcha al momento.

const CACHE_NAME = 'nmaspi-v2.26';
const STATIC_ASSETS = [
  './nmaspi.html',
];

// Instalación: precachear assets estáticos (resiliente: un asset que falte no
// aborta la instalación del SW)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(STATIC_ASSETS.map(a => cache.add(a))))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Error en install:', err))
  );
});

// Activación: limpiar caches antiguos (incluida cualquier 'planes-ies-*' previa)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first para navegación, cache-first para assets
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Solo http(s) (v2.23): las extensiones del navegador inyectan peticiones con
  // otros esquemas (chrome-extension:) que atraviesan este handler; cache.put()
  // con ellas lanza "TypeError: Failed to execute 'put' on 'Cache': Request
  // scheme ... is unsupported". Se ignoran sin más.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Saltar Firebase y CDNs dinámicos
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic') ||
      url.hostname.includes('cdnjs')) {
    return;
  }

  // Navegación (HTML): network-first, fallback a cache
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./nmaspi.html')))
    );
    return;
  }

  // Assets estáticos: cache-first con actualización en segundo plano
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Actualizar en segundo plano
        fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

// Mensajes del cliente
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
