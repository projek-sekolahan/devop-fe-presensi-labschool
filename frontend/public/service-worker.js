// Import Firebase Messaging Libraries
importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js");

// Cache Configuration
const CACHE_NAME = "my-cache-v1";
const OFFLINE_URL = "/frontend/offline.html"; // Offline fallback page
const ASSETS_TO_CACHE = [
    "/",            // Home
    OFFLINE_URL,    // Offline fallback page
];

// Install Event: Cache Assets
self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Caching assets...");

            // Tambahkan asset satu per satu untuk mempermudah debugging
            const assetPromises = ASSETS_TO_CACHE.map((asset) => {
                return cache.add(asset).catch((error) => {
                    console.error(`[Service Worker] Gagal cache asset: ${asset}`, error);
                });
            });

            return Promise.all(assetPromises);
        })
    );

    self.skipWaiting();
});

// Activate Event: Clear Old Caches
self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activating...");

    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("[Service Worker] Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

// Fetch Event: Serve Cached Resources or Fetch from Network
self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        // Handle navigation requests (e.g., HTML pages)
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
    } else {
        // Handle other requests (e.g., assets)
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((networkResponse) => {
                    // Cache the new response
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
            })
        );
    }
});

// Firebase Messaging Setup
let firebaseConfig = null;

self.addEventListener("message", async (event) => {
    if (event.data && event.data.type === "INIT_FIREBASE") {
        firebaseConfig = event.data.config;
        console.log("Menerima konfigurasi Firebase:", firebaseConfig);

        try {
            const app = initializeApp(firebaseConfig);
            const messaging = messaging(app);

            // Setup untuk pesan latar belakang
            messaging.setBackgroundMessageHandler(function (payload) {
                console.log("[firebase-messaging-sw] Pesan background diterima:", payload);
                const notificationTitle = payload.notification?.title || "Pesan Baru";
                const notificationOptions = {
                    body: payload.notification?.body || "Anda memiliki pesan baru.",
                };
                self.registration.showNotification(notificationTitle, notificationOptions);
            });

            // Kirim pesan ke aplikasi utama bahwa Firebase berhasil diinisialisasi
            event.source.postMessage({
                type: "FIREBASE_INITIALIZED",
                success: true,
            });
        } catch (error) {
            console.error("Error initializing Firebase in Service Worker:", error);
            event.source.postMessage({
                type: "FIREBASE_INITIALIZED",
                success: false,
                error: error.message,
            });
        }
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