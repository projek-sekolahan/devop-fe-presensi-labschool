// index.js
import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { registerServiceWorker, requestNotificationPermission } from "./Components/firebaseMessaging.jsx";

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