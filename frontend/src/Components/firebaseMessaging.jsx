import firebaseConfig from "./firebaseConfig";
import {
    parseJwt,
    getFormData,
    alertMessage,
    handleSessionError,
    handleSessionExpired,
    addDefaultKeys,
} from "./utils/utils";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Daftarkan Service Worker
export const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        // Periksa apakah firebaseConfig sudah terdefinisi
        if (typeof firebaseConfig === 'undefined' || !firebaseConfig) {
            console.error("firebaseConfig belum terdefinisi. Pastikan konfigurasi Firebase sudah benar.");
            return;
        }
        try {
            const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            console.log("Service Worker terdaftar dengan cakupan:", registration.scope);
            return registration;
        } catch (err) {
            console.error("Pendaftaran Service Worker gagal:", err);
        }
    } else {
        console.warn("Service Worker tidak didukung di browser ini.");
    }
};

// Request izin untuk notifikasi dan dapatkan token
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const currentToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });
            if (currentToken) {
                console.log("Token diperoleh:", currentToken);
                return currentToken;
            } else {
                console.error("Token tidak ditemukan.");
            }
        } else {
            console.error("Izin notifikasi ditolak.");
        }
    } catch (err) {
        console.error("Error meminta izin notifikasi:", err);
    }
};

// Menerima pesan notifikasi
export const handleOnMessage = (callback) => {
    onMessage(messaging, (payload) => {
        console.log("Pesan masuk:", payload);
        if (callback) {
            callback(payload);
        }
    });
};