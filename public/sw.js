// ━━━ Cache versioning ━━━
const CACHE_VERSION = 'v3';
const PRECACHE_NAME = `precache-${CACHE_VERSION}`;
const RUNTIME_NAME = `runtime-${CACHE_VERSION}`;

// ━━━ Precache list ━━━
const PRECACHE_URLS = ['/', '/offline'];

// ━━━ Install: precache essential assets ━━━
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
    // No llamar skipWaiting() aquí — se maneja via mensaje del cliente
});

// ━━━ Activate: limpiar caches antiguos ━━━
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter((name) => name !== PRECACHE_NAME && name !== RUNTIME_NAME)
                        .map((name) => caches.delete(name))
                )
            )
    );
    self.clients.claim();
});

// ━━━ Escuchar mensaje SKIP_WAITING del cliente ━━━
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ━━━ Fetch: estrategias de cache por tipo de recurso ━━━
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Nunca cachear solicitudes que no sean GET
    if (request.method !== 'GET') return;

    // Ignorar solicitudes cross-origin
    if (url.origin !== self.location.origin) return;

    // Cache First — assets estáticos con hash (inmutables)
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Network First — navegación HTML con fallback offline
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstWithOfflineFallback(request));
        return;
    }

    // Stale-While-Revalidate — imágenes, fuentes y assets públicos
    if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|otf)$/)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Default: network only (API routes, etc.)
});

// ━━━ Implementación de estrategias ━━━

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(RUNTIME_NAME);
        cache.put(request, response.clone());
    }
    return response;
}

async function networkFirstWithOfflineFallback(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return caches.match('/offline') || new Response('Offline', { status: 503 });
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || fetchPromise;
}

// ━━━ Push notification handler ━━━
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const { title, body, icon, badge, url } = event.data.json();
    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: icon || '/icon-192.svg',
            badge: badge || '/icon-192.svg',
            data: { url: url || '/' },
        })
    );
});

// Manejo de clic en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow(targetUrl);
        })
    );
});
