import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging.js";
import { precacheAndRoute } from "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-precaching.prod.js";
import { registerRoute } from "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-routing.prod.js";
import { StaleWhileRevalidate } from "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-strategies.prod.js";

const CACHE = "pwabuilder-offline-page";
const offlineFallbackPage = "offline.html";

// Precache offline.html
precacheAndRoute([
  { url: offlineFallbackPage, revision: null },
]);

// Routing dengan Workbox untuk caching
registerRoute(
  ({ request }) => request.destination === "document",
  new StaleWhileRevalidate({
    cacheName: CACHE,
  })
);

// Caching offline.html
self.addEventListener("install", async (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      console.log("Caching offline page:", offlineFallbackPage);
      return cache.add(offlineFallbackPage);
    }).catch((err) => {
      console.error("Error caching offline page:", err);
    })
  );
  self.skipWaiting();
});

// Routing with Workbox
workbox.routing.registerRoute(
  new RegExp("/*"),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);

// Firebase Messaging Setup
let firebaseConfig = null;

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE") {
    firebaseConfig = event.data.config;
    console.log("Menerima konfigurasi Firebase:", firebaseConfig);

    try {
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      // Setup untuk pesan latar belakang
      messaging.setBackgroundMessageHandler((payload) => {
        console.log("[firebase-messaging-sw.js] Pesan background diterima:", payload);
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

// Fallback navigasi offline
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;
          if (preloadResp) {
            return preloadResp;
          }
          const networkResp = await fetch(event.request);
          return networkResp;
        } catch (error) {
          const cache = await caches.open(CACHE);
          const cachedResp = await cache.match(offlineFallbackPage);
          if (cachedResp) {
            return cachedResp;
          }
          console.error("Tidak ada cache atau fallback yang ditemukan.");
          return new Response("Tidak dapat mengakses halaman. Coba lagi nanti.", { status: 503 });
        }
      })()
    );
  }
});