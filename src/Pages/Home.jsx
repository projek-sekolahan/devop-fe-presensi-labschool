import { useState, useEffect, useCallback } from "react";
import {
    parseJwt,
    getFormData,
    alert,
    handleSessionError,
    handleSessionExpired,
    addDefaultKeys,
} from "../utils/utils";
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
            let keys = ["AUTH_KEY", "login_token"];
            const combinedKeys = addDefaultKeys(keys);
            // let values = combinedKeys.map((key) => localStorage.getItem(key));
            // console.log(values);
            // values = [...values, Cookies.get("csrf")];
            // Fetch values from localStorage and Cookies
            let values = combinedKeys.map((key) => {
                let value = localStorage.getItem(key);
                if (key === "csrf_token" && !value) {
                    value = Cookies.get("csrf"); // Fallback to Cookies if csrf_token is null in localStorage
                }
                return value;
            });

            const response = await apiXML.usersPost(
                "profile",
                values[0],
                getFormData(combinedKeys, values),
            );
            const res = JSON.parse(response);

            if (res?.data) {
                localStorage.setItem("token", res.data);
                Cookies.set("csrf", res.csrfHash);
                const user = parseJwt(res.data);
                localStorage.setItem("group_id", user.group_id);
                setUserData(user);
            } else {
                console.error("No data in API response:", res);
            }
        } catch (error) {
            handleSessionError(error, "/login");
        }
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                let keys = ["AUTH_KEY"];
                const combinedKeys = addDefaultKeys(keys);
                let values = combinedKeys.map((key) => localStorage.getItem(key));
                values = [...values, Cookies.get("csrf")];

                const res = await apiXML.authPost(
                    "sessTime",
                    values[1],
                    getFormData(combinedKeys, values),
                );
                const parsedRes = JSON.parse(res);

                if (parsedRes.data.title === "Your Session OK") {
                    Cookies.set("csrf", parsedRes.csrfHash);
                } else {
                    handleSessionExpired(parsedRes.data);
                }
            } catch (err) {
                handleSessionError(err, "/login");
            }
        };

        const intervalId = setInterval(checkSession, 60 * 60 * 1000);
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
        if (!localStorage.getItem("token_registered")) {
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
                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                };
                alert("success", notificationTitle, notificationOptions.body);
            });
        }
    }, []);

    const registerToken = (currentToken) => {
        let keys = ["AUTH_KEY", "login_token", "token_fcm"];
        const combinedKeys = addDefaultKeys(keys);
        let values = [
            ...combinedKeys.slice(0, -1).map((key) => localStorage.getItem(key)),
            currentToken,
        ];
        localStorage.setItem("token_fcm", currentToken);
        apiXML.getCsrf().then((res) => {
            res = JSON.parse(res);
            values = [...values, res.csrfHash];
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
                    handleSessionError(error, "/login");
                });
        });
    };

    window.addEventListener("click", (e) => {
        if (e.pageX > (screen.width * 75) / 100) {
            setShow(false);
        }
    });

    return !userData ? (
        <Loading />
    ) : (
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-6 relative text-white px-6">
            <img
                src="/Icons/elipse.svg"
                alt="elipse"
                className="w-full min-h-fit absolute z-[1] left-0 top-[-30px] "
            />
            <div id="core" className="relative z-[2] size-full">
                <nav className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            setShow(true);
                        }}
                    >
                        <Bars3Icon className="fill-white size-8" />
                    </button>
                    <div id="profile" className="flex items-center gap-2">
                        <img
                            src={userData.img_location}
                            alt="photo_profile"
                            className="size-12 rounded-full bg-white"
                        />
                        <p className="font-semibold text-sm ">
                            {userData.nama_lengkap}
                        </p>
                    </div>
                    <Link to="/notifikasi">
                        <BellIcon className="fill-white size-8" />
                    </Link>
                </nav>
                <main className="mt-8 h-56 sm:h-52">
                    <div id="news" className="size-full">
                        <Carousel
                            leftControl=" "
                            rightControl=" "
                            className="drop-shadow-[4px_4px_2px_rgba(0,0,0,0.5)]"
                        >
                            <img src="/img/news.png" className="" />
                            <img src="/img/news.png" className="" />
                            <img src="/img/news.png" className="" />
                            <img src="/img/news.png" className="" />
                        </Carousel>
                        <div
                            id="rekap"
                            className="bg-white h-3/5 mt-5 rounded-2xl px-3 py-2"
                        >
                            <h3 className="text-primary-md font-bold text-base">
                                {"Rekapan Presensi (Bulan Ini)"}
                            </h3>
                            <div className="flex justify-between mt-2">
                                <div id="hadir" className="w-24">
                                    <div className="mx-auto bg-secondary-green size-[50px] rounded-full p-[10px]">
                                        <p className="text-center text-lg font-bold">
                                            {userData.hadir
                                                ? userData.hadir
                                                : 0}
                                        </p>
                                    </div>
                                    <h4 className="text-center text-xs font-bold text-primary-md">
                                        Hadir
                                    </h4>
                                </div>
                                <div id="izin" className="w-24">
                                    <div className="mx-auto bg-secondary-yellow size-[50px] rounded-full p-[10px]">
                                        <p className="text-center text-lg font-bold">
                                            {userData.tidak_hadir
                                                ? userData.tidak_hadir
                                                : 0}
                                        </p>
                                    </div>
                                    <h4 className="text-center text-xs font-bold text-primary-md">
                                        Izin / Sakit
                                    </h4>
                                </div>
                                <div id="terlambat" className="w-24">
                                    <div className="mx-auto bg-secondary-red size-[50px] rounded-full p-[10px]">
                                        <p className="text-center text-lg font-bold">
                                            {userData.terlambat_pulang_cepat
                                                ? userData.terlambat_pulang_cepat
                                                : 0}
                                        </p>
                                    </div>
                                    <h4 className="text-center text-xs font-bold text-primary-md">
                                        Terlambat
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <Link
                            id="presensi"
                            to={
                                localStorage.getItem("group_id") == "4"
                                    ? "/presensi"
                                    : "/presensi/staff"
                            }
                            className="bg-white w-full h-fit mt-5 rounded-2xl px-3 py-2 flex gap-2 items-center"
                        >
                            <div className="size-10 bg-primary-md rounded-full flex justify-center items-center">
                                <CheckCircleIcon className="size-6" />
                            </div>
                            <p className="text-primary-md text-center font-bold text-sm">
                                Presensi
                            </p>
                            <ChevronRightIcon className="absolute size-4 stroke-bg-3 right-10" />
                        </Link>
                        <Link
                            id="riwayat_presensi"
                            to="/riwayat"
                            className="bg-white w-full h-fit mt-5 rounded-2xl px-3 py-2 flex gap-2 items-center"
                        >
                            <div className="size-10 bg-primary-md rounded-full flex justify-center items-center">
                                <ClockIcon className="size-6" />
                            </div>
                            <p className="text-primary-md text-center font-bold text-sm">
                                Riwayat Presensi
                            </p>
                            <ChevronRightIcon className="absolute size-4 stroke-bg-3 right-10" />
                        </Link>
                    </div>
                </main>
            </div>
            <SideMenu show={show} data={userData} />
        </div>
    );
};
export default Home;
