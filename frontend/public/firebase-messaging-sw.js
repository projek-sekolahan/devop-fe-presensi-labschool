// Import Firebase modules
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// Push Event
self.addEventListener('push', (event) => {
  if (event.data) {
      const payload = event.data.json();
      const notificationTitle = payload.notification?.title || "New Message";
      const notificationOptions = {
          body: payload.notification?.body || "You have a new message.",
          icon: payload.notification?.icon || "/frontend/Icons/splash.png",
          data: { url: "https://smartapps.smalabschoolunesa1.sch.id" + payload.notification?.url || "/" } // Menyimpan URL
      };
      event.waitUntil(
          self.registration.showNotification(notificationTitle, notificationOptions)
      );
  }
  else {
    console.warn("[SW] Push event received without data.");
    return;
  }
});

// Push Subscription Change Event
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
      self.registration.pushManager.subscribe({ userVisibleOnly: true }).then((subscription) => {
          console.log('[SW] Resubscribed:', subscription);
      })
  );
});

// iOS Fallback for Notifications
self.addEventListener("notificationclick", (event) => {
    event.notification.close(); // Menutup notifikasi saat diklik

    // Cek apakah pengguna menggunakan iOS (iPhone atau iPad)
    if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) {
        console.warn("[SW] Notifications are not fully supported on iOS Safari.");
        event.waitUntil(
            self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return self.clients.openWindow("https://smartapps.smalabschoolunesa1.sch.id/bantuan"); // Redirect ke halaman bantuan
            })
        );
        return;
    }

    // Ambil URL dari notifikasi jika tersedia
    const clickUrl = event.notification.data?.url || "/";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === clickUrl && "focus" in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(clickUrl);
            }
        })
    );
});

// Firebase Messaging Setup
let firebaseConfig = null;

self.addEventListener("message", async (event) => {
    firebaseConfig = event.data.config;
    if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.messagingSenderId) {
        console.error("[SW] Invalid Firebase configuration:", firebaseConfig);
        event.source.postMessage({
            type: "FIREBASE_INITIALIZED",
            success: false,
            error: "Invalid Firebase configuration."
        });
        return;
    }
    if (event.data.type === "FIREBASE_INITIALIZED") {
        try {
            // Initialize Firebase App Pastikan Firebase hanya diinisialisasi sekali
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            const messaging = firebase.messaging();
            // Handle background messages
            messaging.onBackgroundMessage((payload) => {
                const notificationTitle = payload.notification?.title || "New Message";
                const notificationOptions = {
                    body: payload.notification?.body || "You have a new message.",
                    icon: payload.notification?.icon || "/frontend/Icons/splash.png",
                    data: { url: "https://smartapps.smalabschoolunesa1.sch.id" + payload.notification?.url || "/" } // Menyimpan URL
                };
                self.registration.showNotification(notificationTitle, notificationOptions);
            });
            event.source.postMessage({
                type: "FIREBASE_INITIALIZED",
                success: true,
            });
        } catch (error) {
            console.error("[SW] Error initializing Firebase:", error);
            event.source.postMessage({
                type: "FIREBASE_INITIALIZED",
                success: false,
                error: error.message,
            });
        }
    }
});

// Cache Configuration
const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URL = "/frontend/offline.html"; // Offline fallback page
const ASSETS_TO_CACHE = [OFFLINE_URL];

// Install Event: Cache Assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            const assetPromises = ASSETS_TO_CACHE.map((asset) => {
                return cache.add(asset).catch((error) => {
                    console.error(`[SW] Failed to cache asset: ${asset}`, error);
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
        console.warn("[SW] Ignoring chrome-extension request:", url.href);
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
                console.error("[SW] Fetch error:", err);
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