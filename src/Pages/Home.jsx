import { useState, useEffect, useCallback } from "react";
import { parseJwt, getFormData, alert } from "../utils/utils";
import apiXML from "../utils/apiXML.js";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/solid";
import {
    CheckCircleIcon,
    ClockIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Carousel } from "flowbite-react";
import { HomeIcon, UserIcon } from "@heroicons/react/20/solid";
import SideMenu from "/src/Components/SideMenu";
import Cookies from "js-cookie";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import {
    getMessaging,
    getToken,
    onMessage,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyANCfphvM408UXtVutV3s3JUWcv50Wox4s",
    authDomain: "projek-sekolah-1acb4.firebaseapp.com",
    projectId: "projek-sekolah-1acb4",
    storageBucket: "projek-sekolah-1acb4.appspot.com",
    messagingSenderId: "796889279454",
    appId: "1:796889279454:web:b9c53d12f01f3551f38b4f",
    measurementId: "G-NWG3GGV7DF",
};

const Home = () => {
    const [show, setShow] = useState(false);
    const [userData, setUserData] = useState(null);

    const fetchUserData = useCallback(async () => {
        try {
            let keys = ["AUTH_KEY", "devop-sso", "login_token"];
            let values = keys.map((key) => localStorage.getItem(key));

            keys = [...keys, "csrf_token"];
            values = [...values, Cookies.get("csrf")];

            console.log("Fetching user data...");
            const response = await apiXML.getUserData(
                values[0],
                getFormData(keys, values),
            );
            const res = JSON.parse(response);

            if (res?.data) {
                localStorage.setItem("token", res.data);
                Cookies.set("csrf", res.csrfHash);
                const user = parseJwt(res.data);
                console.log(user);
                setUserData(user);
            } else {
                console.error("No data in API response:", res);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            window.location.replace("/login");
        }
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                let keys = ["devop-sso", "AUTH_KEY"];
                let values = keys.map((key) => localStorage.getItem(key));

                keys = [...keys, "csrf_token"];
                values = [...values, Cookies.get("csrf")];

                const res = await apiXML.sessTime(
                    values[1],
                    getFormData(keys, values),
                );
                const parsedRes = JSON.parse(res);

                if (parsedRes.data.title === "Your Session OK") {
                    Cookies.set("csrf", parsedRes.csrfHash);
                } else {
                    handleSessionExpired(parsedRes.data);
                }
            } catch (err) {
                handleSessionError(err);
            }
        };

        const intervalId = setInterval(checkSession, 2 * 60 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!localStorage.getItem("login_token")) {
            window.location.replace("/login");
        } else {
            fetchUserData();
        }
    }, [fetchUserData]);

    useEffect(() => {
        if (userData) {
            localStorage.setItem("group_id", userData.group_id);
        }
    }, [userData]);

    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const messaging = getMessaging(app);

        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                alert(
                    "success",
                    "Notification",
                    "Notification permission granted.",
                );
                getToken(messaging, {
                    vapidKey:
                        "BLLw96Dsif69l4B9zOjil0_JLfwJn4En4E7FRz5n1U8jgWebZ-pWi7B0z7MTehhYZ7jM1c2sXo6E8J7ldrAAngw",
                })
                    .then((currentToken) => registerToken(currentToken))
                    .catch(() =>
                        alert(
                            "error",
                            "Notification",
                            "Terjadi kesalahan saat mendapatkan token. Pastikan izin notifikasi diberikan.",
                        ),
                    );
            } else {
                alert(
                    "error",
                    "Notification",
                    "Notification permission denied.",
                );
            }
        });

        onMessage(messaging, (payload) => {
            const { title, body } = payload.notification;
            if (Notification.permission === "granted") {
                new Notification(title, { body });
            }
        });
    }, []);

    const handleSessionExpired = (data) => {
        alert("error", data.title, data.message, () => {
            localStorage.clear();
            window.location.replace("/login");
        });
    };

    const handleSessionError = (err) => {
        const parsedError = JSON.parse(err.responseText || "{}");
        localStorage.clear();
        alert(
            parsedError.data.info,
            parsedError.data.title,
            parsedError.data.message,
            () => {
                window.location.replace("/login");
            },
        );
    };

    const registerToken = (currentToken) => {
        let keys = ["AUTH_KEY", "devop-sso", "login_token", "token_fcm"];
        let values = [
            ...keys.slice(0, -1).map((key) => localStorage.getItem(key)),
            currentToken,
        ];

        keys = [...keys, "csrf_token"];
        values = [...values, Cookies.get("csrf")];

        apiXML
            .registerToken(values[0], getFormData(keys, values))
            .then((response) => {
                const res = JSON.parse(response);
                Cookies.set("csrf", res.csrfHash);
                console.log("Token registered successfully");
            })
            .catch(handleSessionError);
    };

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
                className="w-full min-h-fit absolute z-[1] left-0 top-0"
            />
            <nav className="relative z-[2] flex items-center justify-between mb-6">
                <button
                    onClick={() => setShow(!show)}
                    className="bg-white rounded-lg p-1"
                >
                    <Bars3Icon className="size-8" />
                </button>
                <div className="flex flex-col items-center gap-1">
                    {userData ? (
                        <>
                            <img
                                src={
                                    userData.img_location ||
                                    "/default-profile.png"
                                }
                                alt="user"
                                className="w-[40px] h-[40px] rounded-full"
                            />
                            <p className="font-semibold">{userData.fullname}</p>
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
                        src="https://images.unsplash.com/photo-1677606752374-40b7ff2287d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWd8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                        alt="image 1"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1677606752374-40b7ff2287d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWd8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                        alt="image 2"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1677606752374-40b7ff2287d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWd8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
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
};
export default Home;
