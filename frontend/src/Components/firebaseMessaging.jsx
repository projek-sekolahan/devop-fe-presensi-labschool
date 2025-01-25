import firebaseConfig from "./firebaseConfig";
import { alertMessage } from "../utils/utils";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging.js";
import Cookies from "js-cookie";

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Validasi firebaseConfig
if (!firebaseConfig || typeof firebaseConfig !== "object") {
    console.error("firebaseConfig tidak valid.");
    throw new Error("firebaseConfig tidak valid.");
}

// Daftarkan Service Worker
export const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("SW atau Push API tidak didukung.");
        return null;
    }
    try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js",{ scope: "/" });
        // Saat SW berhasil terdaftar, perbarui token FCM
        await refreshFCMToken();
        return registration;
    } catch (err) {
        console.error("Pendaftaran SW gagal:", err);
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
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const currentToken = await getToken(messaging, { vapidKey });
            if (currentToken) {
                localStorage.setItem("token_fcm", currentToken);
                // Kirim konfigurasi Firebase ke Service Worker
                const firebaseConfigMessage = {
                    type: "FIREBASE_INITIALIZED",
                    config: firebaseConfig,
                };
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage(firebaseConfigMessage);
                } else {
                    console.warn("Tidak ada controller SW untuk mengirim konfigurasi Firebase.");
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

// Tambahkan Listener untuk Refresh Token
const refreshFCMToken = async () => {
    try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        const newToken = await getToken(messaging, { vapidKey });

        if (newToken) {
            console.log("FCM Token diperbarui:", newToken);
            localStorage.setItem("token_fcm", newToken);
            Cookies.set("token_registered", "false");
            window.location.reload();
        } else {
            console.warn("Tidak ada token baru yang tersedia.");
        }
    } catch (error) {
        console.error("Error saat memperbarui token:", error);
    }
};

// Pemanggilan manual saat token perlu diperbarui
setInterval(() => {
    refreshFCMToken(); // Atur interval pembaruan token (contoh: setiap 24 jam)
}, 24 * 60 * 60 * 1000); // 24 jam

// Menerima pesan notifikasi
export const handleOnMessage = (callback) => {
    try {
        onMessage(messaging, async (payload) => {
            if (callback && typeof callback === "function") {
                callback(payload);
            }
            // Kirim pesan payload ke Service Worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: "NOTIFICATION_RECEIVED",
                    payload,
                });
            } else {
                console.warn("Tidak ada controller SW. Menunggu hingga SW siap...");
                try {
                    // Fallback jika SW belum mengontrol halaman
                    const registration = await navigator.serviceWorker.ready;
                    if (registration.active) {
                        registration.active.postMessage({
                            type: "NOTIFICATION_RECEIVED",
                            payload,
                        });
                    } else {
                        console.error("SW tetap tidak siap setelah fallback.");
                    }
                } catch (err) {
                    console.error("Error pada fallback SW:", err);
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