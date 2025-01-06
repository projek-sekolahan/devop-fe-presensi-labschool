// import { initializeApp } from './firebase/app';
// import { getMessaging, onBackgroundMessage } from './firebase/messaging';
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');


const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URL = "offline.html";

// Pre-cache offline.html
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching offline page...");
      return cache.addAll([OFFLINE_URL]);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker and clear old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
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