import firebaseConfig from "./firebaseConfig";
import { alertMessage } from "../utils/utils";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging.js";
/* import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging"; */

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase Config:", app);
const messaging = getMessaging(app);
console.log("Firebase Messaging:", messaging);

// Validasi firebaseConfig
if (!firebaseConfig || typeof firebaseConfig !== "object") {
    console.error("firebaseConfig tidak valid.");
    throw new Error("firebaseConfig tidak valid.");
}

// Daftarkan Service Worker
export const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Service Worker atau Push API tidak didukung.");
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js",{ scope: "/" });
        console.log("Service Worker berhasil didaftarkan:", registration.scope);

        // Kirim konfigurasi Firebase ke Service Worker
        const firebaseConfigMessage = {
            type: "FIREBASE_INITIALIZED",
            config: firebaseConfig,
        };

        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(firebaseConfigMessage);
            console.log("Konfigurasi Firebase dikirim ke Service Worker:", firebaseConfig);
        } else {
            console.warn("Tidak ada controller Service Worker untuk mengirim konfigurasi Firebase.");
        }

        // Kirim pesan ke Service Worker setelah pendaftaran
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: "SW_REGISTERED",
                message: "Service Worker telah berhasil didaftarkan.",
            });
            console.log("Pesan dikirim ke Service Worker: Service Worker berhasil didaftarkan.");
        } else {
            console.warn("Tidak ada controller Service Worker untuk mengirim pesan.");
        }

        return registration;
    } catch (err) {
        console.error("Pendaftaran Service Worker gagal:", err);
        return null;
    }
};

// Request izin notifikasi dan dapatkan token
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        alertMessage("Notification", "Browser ini tidak mendukung notifikasi.", "error", () => {
            window.location.href = "/login";
        });
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Izin notifikasi diberikan.");
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const currentToken = await getToken(messaging, { vapidKey });

            if (currentToken) {
                localStorage.setItem("token_fcm", currentToken);
                console.log("Token FCM disimpan ke localStorage:", currentToken);

                // Kirim token FCM ke Service Worker
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: "FCM_TOKEN",
                        token: currentToken,
                    });
                    console.log("Token FCM dikirim ke Service Worker.");
                } else {
                    console.warn("Tidak ada controller Service Worker untuk mengirim token FCM.");
                }

                return currentToken;
            } else {
                console.error("Gagal mendapatkan token notifikasi.");
                return null;
            }
        } else {
            console.error("Izin notifikasi ditolak.");
            return null;
        }
    } catch (err) {
        console.error("Error saat meminta izin notifikasi:", err);
        return null;
    }
};

// Menerima pesan notifikasi
export const handleOnMessage = (callback) => {
    try {
        onMessage(messaging, async (payload) => {
            console.log("Pesan notifikasi diterima:", payload);
            if (callback && typeof callback === "function") {
                callback(payload);
            }
            // Kirim pesan payload ke Service Worker
            if (navigator.serviceWorker.controller) {
                console.log("Mengirim pesan NOTIFICATION_RECEIVED ke Service Worker...");
                navigator.serviceWorker.controller.postMessage({
                    type: "NOTIFICATION_RECEIVED",
                    payload,
                });
                console.log("Pesan notifikasi dikirim ke Service Worker:", payload);
            } else {
                console.warn("Tidak ada controller Service Worker. Menunggu hingga Service Worker siap...");
                try {
                    // Fallback jika SW belum mengontrol halaman
                    const registration = await navigator.serviceWorker.ready;
                    if (registration.active) {
                        console.log("Mengirim kembali pesan active NOTIFICATION_RECEIVED ke Service Worker...");
                        registration.active.postMessage({
                            type: "NOTIFICATION_RECEIVED",
                            payload,
                        });
                        console.log("Pesan notifikasi dikirim ke Service Worker setelah siap:", payload);
                    } else {
                        console.error("Service Worker tetap tidak siap setelah fallback.");
                    }
                } catch (err) {
                    console.error("Error pada fallback Service Worker:", err);
                }
            }
        });
    } catch (err) {
        console.error("Gagal menerima pesan notifikasi:", err);
        alertMessage("Error", `Terjadi kesalahan saat menerima pesan notifikasi: ${err.message}`, "error", () => {
            window.location.href = "/login";
        });
    }
};