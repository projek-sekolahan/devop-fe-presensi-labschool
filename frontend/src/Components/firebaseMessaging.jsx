import firebaseConfig from "./firebaseConfig";
import {
    parseJwt,
    getFormData,
    alertMessage,
    addDefaultKeys,
} from "../utils/utils";
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
// Validasi firebaseConfig
if (!firebaseConfig || typeof firebaseConfig !== "object") {
    console.error("firebaseConfig belum terdefinisi atau tidak valid. Pastikan konfigurasi Firebase sudah benar.");
    alertMessage("Error", "Firebase config tidak valid. Periksa konfigurasi Anda.", "error", ()=>navigate("/login"));
    throw new Error("firebaseConfig tidak valid.");
}

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Daftarkan Service Worker
export const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Service Worker atau Push API tidak didukung di browser ini.");
        alertMessage("Warning", "Service Worker atau Push API tidak didukung di browser ini.", "warning", ()=>navigate("/login"));
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register(
            `https://smartapps.smalabschoolunesa1.sch.id/frontend/firebase-messaging-sw.js?v=${new Date().getTime()}`,
            { scope: '/' }
        );
        
        if (!registration) {
            console.error("Pendaftaran Service Worker gagal.");
            alertMessage("Error", "Gagal mendaftarkan Service Worker.", "error", ()=>navigate("/login"));
            return;
        }

        // const registrationReady = await navigator.serviceWorker.ready;
        console.log("Service Worker terdaftar dengan cakupan:", registration.scope);
        return false;
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

        if (registrationReady.active) {
            console.log("Service Worker aktif. Mengirim pesan untuk inisialisasi Firebase.");
            registrationReady.active.postMessage({
                type: "INIT_FIREBASE",
                config: firebaseConfig,
            });
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
            alertMessage("Error", "Service Worker tidak aktif.", "error", ()=>navigate("/login"));
        }

        return registration;

    } catch (err) {
        console.error("Pendaftaran Service Worker gagal:", err);
        alertMessage("Error", `Pendaftaran Service Worker gagal: ${err.message}`, "error", ()=>navigate("/login"));
    }
};

// Request izin untuk notifikasi dan dapatkan token
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        alertMessage("Notification", "Browser ini tidak mendukung notifikasi.", "error", ()=>navigate("/login"));
        return;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Izin notifikasi diberikan.");
            alertMessage("Notification", "Notification permission granted.", "success", ()=>navigate("/login"));

            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const currentToken = await getToken(messaging, { vapidKey });

            if (currentToken) {
                registerToken(currentToken); // Pastikan fungsi `registerToken` terdefinisi
            } else {
                console.error("Gagal mendapatkan token.");
                alertMessage("Error", "Gagal mendapatkan token.", "error", ()=>navigate("/login"));
            }

        } else {
            alertMessage("Notification", "Permission denied for notifications.", "error", ()=>navigate("/login"));
        }
    } catch (err) {
        console.error("Error meminta izin notifikasi:", err);
        alertMessage("Error", `Terjadi kesalahan saat meminta izin notifikasi: ${err.message}`, "error", ()=>navigate("/login"));
    }
};

const registerToken = (currentToken) => {
    let keys = ["AUTH_KEY", "login_token", "token_fcm"];
    const combinedKeys = addDefaultKeys(keys);
    localStorage.setItem("token_fcm", currentToken);
    console.log("Token received:", currentToken); return false;
    apiXML.getCsrf().then((res) => {
        res = JSON.parse(res);
        // Fetch values from localStorage and Cookies
        let values = combinedKeys.map((key) => {
            let value = localStorage.getItem(key);
            if (key === "csrf_token" && !value) {
                value = res.csrfHash; // Fallback to Cookies if csrf_token is null in localStorage
            }
            if (key === "token_fcm" && !value) {
                value = currentToken; // Fallback to Cookies if token_fcm is null in localStorage
            }
            return value;
        });
        apiXML
            .notificationsPost(
                "registerToken",
                values[0],
                getFormData(combinedKeys, values),
            )
            .then((response) => {
                const res = JSON.parse(response);
                Cookies.set("csrf", res.csrfHash);
                localStorage.setItem("token_registered", "done");
            })
            .catch((error) => {
                console.error("Error saat memeriksa regist token:", error);
                handleSessionError(error, "/login");
            });
    });
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
        alertMessage("Error", `Terjadi kesalahan saat menerima pesan notifikasi: ${err.message}`, "error", ()=>navigate("/login"));
    }
};
