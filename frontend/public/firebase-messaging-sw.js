importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

// Firebase Messaging Setup
let firebaseConfig = null;

self.addEventListener("message", async (event) => {
    console.log("[SW] Pesan diterima:", event.data);

    firebaseConfig = event.data.config;

    console.log("[SW] Firebase config received:", firebaseConfig);

    if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.messagingSenderId) {
        console.error("[SW] Invalid Firebase configuration:", firebaseConfig);
        event.source.postMessage({
            type: "FIREBASE_INITIALIZED",
            success: false,
            error: "Invalid Firebase configuration."
        });
        return;
    }

    if (event.data.type === "INIT_FIREBASE") {
      console.log("[SW] Konfigurasi Firebase:", event.data.config);
    }

    if (event.data && event.data.type === "FCM_TOKEN") {
        console.log("[SW] Token FCM received:", event.data.token);
    }

    if (event.data && event.data.type === "NOTIFICATION_RECEIVED") {
        console.log("[SW] Notification received:", event.data.payload);
    }

    if (event.data && event.data.type === "FIREBASE_INITIALIZED") {
        console.log("[SW] INITIALIZED received:", event.data.config);

        try {
            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            messaging.setBackgroundMessageHandler(function (payload) {
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