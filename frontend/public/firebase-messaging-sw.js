// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Firebase Messaging Setup
let firebaseConfig = null;

self.addEventListener("message", async (event) => {
    console.log("[SW] Pesan diterima:", event.data);

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
        console.log("[SW] INITIALIZED received:", event.data.config);

        try {
            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            onBackgroundMessage(messaging, (payload) => {
                console.log("[firebase-messaging-sw] Background message received:", payload);
                const notificationTitle = payload.notification?.title || "New Message";
                const notificationOptions = {
                    body: payload.notification?.body || "You have a new message.",
                    icon: payload.notification?.icon || "/frontend/assets/default-icon.png",
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

// iOS Fallback for Notifications
self.addEventListener("notificationclick", (event) => {
    if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) {
        console.warn("[SW] Notifications are not fully supported on iOS Safari.");
        // Handle fallback logic, e.g., open a help page or provide user guidance
        event.notification.close();
        event.waitUntil(
            self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return self.clients.openWindow("/help"); // Redirect to help or fallback page
            })
        );
        return;
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
