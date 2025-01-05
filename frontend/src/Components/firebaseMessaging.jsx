import firebaseConfig from "./firebaseConfig";
import {
    parseJwt,
    getFormData,
    alertMessage,
    handleSessionError,
    handleSessionExpired,
    addDefaultKeys,
} from "../utils/utils";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";

// Validasi firebaseConfig
if (typeof firebaseConfig === "undefined" || !firebaseConfig) {
    console.error("firebaseConfig belum terdefinisi. Pastikan konfigurasi Firebase sudah benar.");
    throw new Error("firebaseConfig tidak valid.");
}

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Daftarkan Service Worker
export const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
        console.warn("Service Worker tidak didukung di browser ini.");
        return;
    }
    try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Service Worker terdaftar dengan cakupan:", registration.scope);
        const registrationReady = await navigator.serviceWorker.ready;
        if (registrationReady.active) {
            registrationReady.active.postMessage({
                type: "INIT_FIREBASE",
                config: firebaseConfig,
            });
        } else {
            console.error("Service Worker tidak aktif.");
        }
        return registration;
    } catch (err) {
        console.error("Pendaftaran Service Worker gagal:", err);
    }
};

// Request izin untuk notifikasi dan dapatkan token
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        alertMessage(
            "Notification",
            "Browser ini tidak mendukung notifikasi.",
            "error"
        );
        return;
    }
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            alertMessage("Notification", "Notification permission granted.", "success");
            const currentToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });
            if (currentToken) {
                console.log("Token received:", currentToken); return false;
                registerToken(currentToken); // Pastikan fungsi ini terdefinisi
            } else {
                console.error("Failed to generate token.");
            }
        } else {
            alertMessage("Notification", "Notification permission denied.", "error");
        }
    } catch (err) {
        console.error("Error meminta izin notifikasi:", err);
    }
};

// Menerima pesan notifikasi
export const handleOnMessage = (callback) => {
    onMessage(messaging, (payload) => {
        console.log("Pesan masuk:", payload);
        if (callback && typeof callback === "function") {
            callback(payload);
        }
    });
};