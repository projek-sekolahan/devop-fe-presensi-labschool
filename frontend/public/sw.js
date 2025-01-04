const CACHE = "pwabuilder-offline-page";
const offlineFallbackPage = "offline.html";

// Workbox Setup
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Caching offline.html
self.addEventListener("install", async (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(offlineFallbackPage))
  );
});

// Routing with Workbox
workbox.routing.registerRoute(
  new RegExp("/*"),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
  })
);

// Fallback untuk navigasi offline
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
          return cachedResp;
        }
      })()
    );
  }
});

// Firebase Messaging Setup
let firebaseConfig = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE") {
    firebaseConfig = event.data.config;

    // Inisialisasi Firebase setelah menerima konfigurasi
    importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js");
    importScripts(
      "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js"
    );

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
      );
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});