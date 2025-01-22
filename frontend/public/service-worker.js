// Cache Configuration
const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URL = "/frontend/offline.html"; // Offline fallback page
const ASSETS_TO_CACHE = [OFFLINE_URL];

// Install Event: Cache Assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Caching assets...");

            const assetPromises = ASSETS_TO_CACHE.map((asset) => {
                return cache.add(asset).catch((error) => {
                    console.error(`[Service Worker] Failed to cache asset: ${asset}`, error);
                });
            });

            return Promise.all(assetPromises);
        })
    );

    self.skipWaiting();
});

// Activate Event: Clear Old Caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("[Service Worker] Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// Fetch Event: Serve Cached Resources or Fetch from Network
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    if (url.protocol === "chrome-extension:") {
        console.warn("[Service Worker] Ignoring chrome-extension request:", url.href);
        return;
    }

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request).then((networkResponse) => {
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === "basic"
                    ) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            }).catch((err) => {
                console.error("[Service Worker] Fetch error:", err);
                if (event.request.mode === "navigate") {
                    return caches.match(OFFLINE_URL);
                }
                return new Response("Resource not available.", {
                    status: 503,
                    statusText: "Service Unavailable",
                });
            })
        );
    }
});

// Notification Click Event: Handle notification interactions
self.addEventListener("notificationclick", (event) => {
    console.log("[Service Worker] Notification clicked:", event.notification);

    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return self.clients.openWindow("/");
        })
    );
});