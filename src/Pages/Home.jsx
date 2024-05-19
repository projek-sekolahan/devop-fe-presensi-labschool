import { Bars3Icon, BellIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon, ClockIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Carousel } from "flowbite-react";
import { Link } from "react-router-dom";
import { HomeIcon, UserIcon } from "@heroicons/react/20/solid";
import SideMenu from "/src/Components/SideMenu";
import { useState, useEffect } from "react";
import { parseJwt, getFormData, alert } from "../utils/utils";
import apiXML from "../utils/apiXML.js";
import Loading from "./Loading";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyANCfphvM408UXtVutV3s3JUWcv50Wox4s",
    authDomain: "projek-sekolah-1acb4.firebaseapp.com",
    projectId: "projek-sekolah-1acb4",
    storageBucket: "projek-sekolah-1acb4.appspot.com",
    messagingSenderId: "796889279454",
    appId: "1:796889279454:web:b9c53d12f01f3551f38b4f",
    measurementId: "G-NWG3GGV7DF",
};

// Fungsi untuk memeriksa sesi
const checkSession = () => {
    const key = ["devop-sso", "AUTH_KEY", "csrf_token"];
    const value = [
        localStorage.getItem("devop-sso"),
        localStorage.getItem("AUTH_KEY"),
        localStorage.getItem("csrf"),
    ];
    apiXML
        .sessTime(localStorage.getItem("AUTH_KEY"), getFormData(key, value))
        .then((res) => {
            res = JSON.parse(res);
            if (res.data.title === "Your Session OK") {
                localStorage.removeItem("csrf");
                localStorage.setItem("csrf", res.csrfHash);
            } else {
                alert("error", res.data.title, res.data.message, () => {
                    localStorage.clear();
                    window.location.replace("/login");
                });
            }
        })
        .catch((err) => {
            if (err.status === 403) {
                localStorage.clear();
                alert(
                    "error",
                    "Credential Expired",
                    "Your credentials has expired. Please login again.",
                    () => window.location.replace("/login"),
                );
            } else {
                err = JSON.parse(err.responseText);
                localStorage.clear();
                alert(err.data.info, err.data.title, err.data.message, () =>
                    window.location.replace("/login"),
                );
            }
        });
};

// Mengatur interval pemeriksaan sesi menjadi setiap 2 jam (7200000 ms)
setInterval(checkSession, 2 * 60 * 60 * 1000);

export default function Home() {
    const [show, setShow] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token"];
            const values = [
                localStorage.getItem("AUTH_KEY"),
                localStorage.getItem("devop-sso"),
                localStorage.getItem("csrf"),
                localStorage.getItem("login_token"),
            ];

            try {
                console.log("Fetching user data...");
                const response = await apiXML.getUserData(
                    localStorage.getItem("AUTH_KEY"),
                    getFormData(keys, values)
                );
                const res = JSON.parse(response);
                console.log("API Response:", res);
                localStorage.setItem("token", res.data);
                localStorage.setItem("csrf", res.csrfHash);
                const user = parseJwt(localStorage.getItem("token"));
                console.log("Parsed User Data:", user);
                setUserData(user);
            } catch (error) {
                console.error("Error fetching user data:", error);
                window.location.replace("/login");
            }
        };

        if (!localStorage.getItem("login_token")) {
            window.location.replace("/login");
        } else {
            fetchUserData();
        }

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const messaging = getMessaging(app);

        // Meminta izin notifikasi dari pengguna
        Notification.requestPermission().then((permission) => {
            // Memeriksa apakah izin diberikan
            if (permission === "granted") {
                alert("success", "Notification", "Notification permission granted.");
                console.log("Notification permission granted.");
                
                // Mendapatkan token FCM
                getToken(messaging, {
                    vapidKey: "BLLw96Dsif69l4B9zOjil0_JLfwJn4En4E7FRz5n1U8jgWebZ-pWi7B0z7MTehhYZ7jM1c2sXo6E8J7ldrAAngw",
                }).then((currentToken) => {
                    console.log("FCM token:", currentToken);

                    // Kirim token ke server untuk menyimpan atau gunakan sesuai kebutuhan
                    apiXML
                        .registerToken(localStorage.getItem("AUTH_KEY"), getFormData([
                            "AUTH_KEY",
                            "devop-sso",
                            "csrf_token",
                            "token",
                            "token_fcm",
                        ], [
                            localStorage.getItem("AUTH_KEY"),
                            localStorage.getItem("devop-sso"),
                            localStorage.getItem("csrf"),
                            localStorage.getItem("login_token"),
                            currentToken,
                        ]))
                        .then((getResponse) => {
                            console.log("Token registered successfully");
                            const res = JSON.parse(getResponse);
                            localStorage.setItem("csrf", res.csrfHash);
                        }).catch((err) => {
                            console.error("Error registering token", err);
                            if (err.status === 403) {
                                localStorage.clear();
                                alert(
                                    "error",
                                    "Credential Expired",
                                    "Your credentials has expired. Please login again.",
                                    () => window.location.replace("/login"),
                                );
                            } else {
                                err = JSON.parse(err.responseText);
                                localStorage.clear();
                                alert(err.data.info, err.data.title, err.data.message, () =>
                                    window.location.replace("/login"),
                                );
                            }
                        });
                }).catch((err) => {
                    alert("error", "Notification", "Terjadi kesalahan saat mendapatkan token. Pastikan izin notifikasi diberikan.");
                });
            } else {
                // Tindakan jika izin ditolak
                alert("error", "Notification", "Notification permission denied.");
            }
        });

        // Handle incoming messages
        onMessage(messaging, (payload) => {
            console.log("Message received:", payload);
            const notificationTitle = payload.notification.title;
            const notificationOptions = {
                body: payload.notification.body,
            };

            // Show the notification using the browser's Notification API
            if (Notification.permission === 'granted') {
                new Notification(notificationTitle, notificationOptions);
            }
        });
    }, []);

    useEffect(() => {
        console.log("User Data updated:", userData);
        if (userData) {
            localStorage.setItem("group_id", userData.group_id);
        }
    }, [userData]);

    window.addEventListener("click", (e) => {
        if (e.pageX > (screen.width * 75) / 100) {
            setShow(false);
        }
    });

    return !userData ? (
        <Loading />
    ) : (
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-6 text-white px-6 relative overflow-hidden">
            <img
                src="/Icons/elipse.svg"
                alt="elipse"
                className="w-full min-h-fit absolute z-[1] left-0 top-[-30px] "
            />
            <nav className="relative z-[2] flex items-center justify-between">
                <button
                    onClick={() => {
                        setShow(true);
                    }}
                >
                    <Bars3Icon className="fill-white size-8" />
                </button>
                <div id="profile" className="flex items-center gap-2">
                    {userData && userData.img_location ? (
                        <>
                            <img
                                src={`${userData.img_location}`}
                                alt="photo_profile"
                                className="size-12 rounded-full bg-white"
                            />
                            <p className="font-semibold text-sm ">
                                {userData.nama_lengkap}
                            </p>
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
                <Link to="/notifikasi">
                    <BellIcon className="size-8" />
                </Link>
            </nav>
            <div className="carousel relative z-[1] h-[300px] mt-8 rounded-xl overflow-hidden">
                <Carousel>
                    <img
                        src="https://images.unsplash.com/photo-1677606752374-40b7ff2287d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                        alt="image 1"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1677606752374-40b7ff2287d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                        alt="image 2"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1677606752374-40b7ff2287d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                        alt="image 3"
                    />
                </Carousel>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
                <Link
                    to="/pengajuan"
                    className="p-4 border border-white rounded-lg flex flex-col items-center justify-center"
                >
                    <ClockIcon className="size-12" />
                    <p className="font-semibold text-sm">Pengajuan</p>
                </Link>
                <Link
                    to="/kehadiran"
                    className="p-4 border border-white rounded-lg flex flex-col items-center justify-center"
                >
                    <CheckCircleIcon className="size-12" />
                    <p className="font-semibold text-sm">Kehadiran</p>
                </Link>
            </div>
            <div className="mt-8">
                <h1 className="text-lg font-bold">Fitur Lainnya</h1>
                <Link
                    to="/profil"
                    className="mt-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <UserIcon className="size-12" />
                        <p>Profil</p>
                    </div>
                    <ChevronRightIcon className="size-8" />
                </Link>
                <Link
                    to="/daftar-hadir"
                    className="mt-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <HomeIcon className="size-12" />
                        <p>Daftar Hadir</p>
                    </div>
                    <ChevronRightIcon className="size-8" />
                </Link>
            </div>
            <SideMenu show={show} close={() => setShow(false)} />
        </div>
    );
}
