import firebaseConfig from "./firebaseConfig";
import {
    parseJwt,
    getFormData,
    alertMessage,
    addDefaultKeys,
} from "../utils/utils";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging.js";

// Validasi firebaseConfig
if (!firebaseConfig || typeof firebaseConfig !== "object") {
    console.error("firebaseConfig belum terdefinisi atau tidak valid. Pastikan konfigurasi Firebase sudah benar.");
    alertMessage("Error", "Firebase config tidak valid. Periksa konfigurasi Anda.", "error");
    throw new Error("firebaseConfig tidak valid.");
}

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Daftarkan Service Worker
export const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
        console.warn("Service Worker tidak didukung di browser ini.");
        alertMessage("Warning", "Service Worker tidak didukung di browser ini.", "warning");
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register("https://smartapps.smalabschoolunesa1.sch.id/firebase-messaging-sw.js?v="+ new Date().getTime(), {
            scope: "/",type: 'module'
        });
        
        if (!registration) {
            console.error("Pendaftaran Service Worker gagal.");
            alertMessage("Error", "Gagal mendaftarkan Service Worker.", "error");
            return;
        }

        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                registration.update().then(() => {
                    console.log("Service Worker diperbarui.");
                }).catch((err) => {
                    console.error("Gagal memperbarui Service Worker:", err);
                });
            } else {
                console.log("Service Worker belum terdaftar.");
            }
        });
        
        console.log("Service Worker terdaftar dengan cakupan:", registration.scope);
        const registrationReady = await navigator.serviceWorker.ready;

        if (registrationReady.active) {
            console.log("Service Worker aktif. Mengirim pesan untuk inisialisasi Firebase.");
            registrationReady.active.postMessage({
                type: "INIT_FIREBASE",
                config: firebaseConfig,
            });
            // Lanjutkan dengan proses langganan notifikasi
            registrationReady.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            }).then(function(subscription) {
                console.log('Pendaftaran notifikasi berhasil:', subscription);
            }).catch(function(error) {
                console.error('Gagal mendaftar notifikasi:', error);
            });
            console.log("Pesan dikirim ke Service Worker untuk inisialisasi Firebase.");
            // Tunggu respons dari Service Worker
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data.type === "FIREBASE_INITIALIZED") {
                    if (event.data.success) {
                        console.log("Firebase berhasil diinisialisasi di Service Worker.");
                    } else {
                        console.error("Inisialisasi Firebase gagal:", event.data.error);
                    }
                }
            });
        } else {
            console.error("Service Worker tidak aktif.");
            alertMessage("Error", "Service Worker tidak aktif.", "error");
        }

        return registration;

    } catch (err) {
        console.error("Pendaftaran Service Worker gagal:", err);
        alertMessage("Error", `Pendaftaran Service Worker gagal: ${err.message}`, "error");
    }
};

// Request izin untuk notifikasi dan dapatkan token
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        alertMessage("Notification", "Browser ini tidak mendukung notifikasi.", "error");
        return;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Izin notifikasi diberikan.");
            alertMessage("Notification", "Notification permission granted.", "success");

            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const currentToken = await getToken(messaging, { vapidKey });

            if (currentToken) {
                console.log("Token received:", currentToken);
                // registerToken(currentToken); // Pastikan fungsi `registerToken` terdefinisi
            } else {
                console.error("Gagal mendapatkan token.");
                alertMessage("Error", "Gagal mendapatkan token.", "error");
            }

        } else {
            alertMessage("Notification", "Permission denied for notifications.", "error");
        }
    } catch (err) {
        console.error("Error meminta izin notifikasi:", err);
        alertMessage("Error", `Terjadi kesalahan saat meminta izin notifikasi: ${err.message}`, "error");
    }
};

// Menerima pesan notifikasi
export const handleOnMessage = (callback) => {
    try {
        onMessage(messaging, (payload) => {
            console.log("Pesan masuk:", payload);
            if (callback && typeof callback === "function") {
                callback(payload);
            }
        });
    } catch (err) {
        console.error("Gagal mendengarkan pesan notifikasi:", err);
        alertMessage("Error", `Terjadi kesalahan saat menerima pesan notifikasi: ${err.message}`, "error");
    }
};
