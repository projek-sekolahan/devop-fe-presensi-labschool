import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { registerServiceWorker, requestNotificationPermission, handleOnMessage } from "./Components/firebaseMessaging.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Inisialisasi Service Worker dan permintaan notifikasi
window.addEventListener("load", async () => {
    // Daftarkan Service Worker
    await registerServiceWorker();

    // Minta izin notifikasi
    const token = await requestNotificationPermission();

    // Tangani pesan masuk
    handleOnMessage((payload) => {
        const { title, body } = payload.notification;
        alert(`${title}: ${body}`);
    });

    /* messaging.onMessage((payload) => {
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
        };
        alertMessage(
            notificationTitle,
            notificationOptions.body,
            "success",
        );
    }); */
});