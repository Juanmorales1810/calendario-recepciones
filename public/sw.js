const CACHE_NAME = 'calendario-v2';
const urlsToCache = ['/'];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
    self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Estrategia: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
    // Ignorar solicitudes que no sean http/https (como chrome-extension://)
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Solo cachear respuestas exitosas
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, intentar obtener desde cache
                return caches.match(event.request);
            })
    );
});

// Manejo de notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Abrir la aplicación cuando se hace clic en la notificación
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si ya hay una ventana abierta, enfocarla
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no, abrir una nueva ventana
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Cerrar notificación
self.addEventListener('notificationclose', (event) => {
    console.log('Notificación cerrada:', event.notification.tag);
});
