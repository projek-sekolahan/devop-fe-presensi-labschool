import firebaseConfig from "./firebaseConfig";
import { alertMessage } from "../utils/utils";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Fungsi navigasi
export const navigateToLogin = () => {
    alertMessage("Error", "Terjadi kesalahan, silakan login ulang.", "error", () => {
        window.location.href = "/login";
    });
};

// Validasi firebaseConfig
if (!firebaseConfig || typeof firebaseConfig !== "object") {
    console.error("firebaseConfig tidak valid.");
    navigateToLogin();
    throw new Error("firebaseConfig tidak valid.");
}

// Daftarkan Service Worker
export const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Service Worker atau Push API tidak didukung.");
        navigateToLogin();
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register(
            `/firebase-messaging-sw.js?v=${new Date().getTime()}`,
            { scope: "/" }
        );
        console.log("Service Worker berhasil didaftarkan:", registration.scope);
        return registration;
    } catch (err) {
        console.error("Pendaftaran Service Worker gagal:", err);
        navigateToLogin();
        return null;
    }
};

// Request izin notifikasi dan dapatkan token
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        alertMessage("Notification", "Browser ini tidak mendukung notifikasi.", "error", navigateToLogin);
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Izin notifikasi diberikan.");
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const currentToken = await getToken(messaging, { vapidKey });

            if (currentToken) {
                console.log("Token notifikasi berhasil diperoleh:", currentToken);
                localStorage.setItem("token_fcm", currentToken);
                console.log("Token FCM disimpan ke localStorage:", currentToken);
                // registerToken(currentToken); // Pastikan token terdaftar di server
                return currentToken;
            } else {
                console.error("Gagal mendapatkan token notifikasi.");
                navigateToLogin();
                return null;
            }
        } else {
            console.error("Izin notifikasi ditolak.");
            navigateToLogin();
            return null;
        }
    } catch (err) {
        console.error("Error saat meminta izin notifikasi:", err);
        navigateToLogin();
        return null;
    }
};

// Menerima pesan notifikasi
export const handleOnMessage = (callback) => {
    try {
        onMessage(messaging, (payload) => {
            console.log("Pesan notifikasi diterima:", payload);
            if (callback && typeof callback === "function") {
                callback(payload);
            }
        });
    } catch (err) {
        console.error("Gagal menerima pesan notifikasi:", err);
        alertMessage("Error", `Terjadi kesalahan saat menerima pesan notifikasi: ${err.message}`, "error", navigateToLogin);
    }
};
