const CACHE = "pwabuilder-offline-page";
const offlineFallbackPage = "offline.html";

// Workbox Setup
importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js");

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

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
      importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js");
      importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging.js");

      firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();

      // Setup untuk pesan latar belakang
      messaging.onBackgroundMessage((payload) => {
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