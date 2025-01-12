// index.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { registerServiceWorker, requestNotificationPermission, handleOnMessage } from "./Components/firebaseMessaging.jsx";

const Root = () => {
    useEffect(() => {
        const initializeFirebase = async () => {
            // Daftarkan Service Worker
            const registration = await registerServiceWorker();
            if (!registration) {
                console.error("Gagal mendaftarkan Service Worker.");
                return;
            }

            // Minta izin notifikasi
            const token = await requestNotificationPermission();
            if (!token) {
                console.error("Gagal mendapatkan token notifikasi.");
                return;
            }

            // Tangani pesan masuk
            handleOnMessage((payload) => {
                const { title, body } = payload.notification;
                alert(`${title}: ${body}`);
            });
        };

        initializeFirebase();
    }, []);

    return <App />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
);
