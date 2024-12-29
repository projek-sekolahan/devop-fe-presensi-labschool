/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
    parseJwt,
    getFormData,
    alertMessage,
    handleSessionError,
    handleSessionExpired,
    addDefaultKeys,
} from "../utils/utils";
import apiXML from "../utils/apiXML.js";
import { Link, useNavigate } from "react-router-dom";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/solid";
import {
    CheckCircleIcon,
    ClockIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Carousel } from "flowbite-react";
import SideMenu from "/src/Components/SideMenu";
import Cookies from "js-cookie";
import Loading from "../Components/Loading";

// Konfigurasi Firebase (diaktifkan jika dibutuhkan nanti)
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
    const [userData, setUserData] = useState(null); // Menyimpan data pengguna
    const navigate = useNavigate();

    // Fungsi untuk mengambil data user
    const fetchUserData = useCallback(async () => {
        try {
            const keys = ["AUTH_KEY", "login_token"];
            const combinedKeys = addDefaultKeys(keys);

            // Ambil nilai dari localStorage dan Cookies
            const values = combinedKeys.map((key) => {
                let value = localStorage.getItem(key);
                if (key === "csrf_token" && !value) {
                    value = Cookies.get("csrf"); // Fallback ke Cookies jika csrf_token null
                }
                return value;
            });

            // Panggil API untuk mengambil data pengguna
            const response = await apiXML.usersPost(
                "profile",
                values[0],
                getFormData(combinedKeys, values)
            );
            const res = JSON.parse(response);

            if (res?.data) {
                localStorage.setItem("token", res.data.token);
                Cookies.set("csrf", res.csrfHash);
                const user = parseJwt(res.data.token); // Parsing token untuk mendapatkan data user
                localStorage.setItem("group_id", user.group_id);
                setUserData(user); // Set state userData
            } else {
                alertMessage("error", "No data in API response", "err");
            }
        } catch (error) {
            console.error("Error saat mengambil data pengguna:", error);
            handleSessionError(error, "/login");
        }
    }, []);

    // Fungsi untuk memeriksa sesi pengguna
    const checkSession = useCallback(async () => {
        try {
            const keys = ["AUTH_KEY"];
            const combinedKeys = addDefaultKeys(keys);

            // Ambil nilai dari localStorage dan Cookies
            const values = combinedKeys.map((key) => {
                let value = localStorage.getItem(key);
                if (key === "csrf_token" && !value) {
                    value = Cookies.get("csrf");
                }
                return value;
            });

            // Panggil API untuk memeriksa sesi
            const res = await apiXML.authPost(
                "sessTime",
                values[1],
                getFormData(combinedKeys, values)
            );
            const parsedRes = JSON.parse(res);

            if (parsedRes.data.title === "Your Session OK") {
                Cookies.set("csrf", parsedRes.csrfHash);
            } else {
                handleSessionExpired(parsedRes.data);
            }
        } catch (err) {
            console.error("Error saat memeriksa sesi:", err);
            handleSessionError(err, "/login");
        }
    }, []);

    // Pemanggilan useEffect untuk memeriksa sesi pengguna setiap 1 jam
    useEffect(() => {
        const intervalId = setInterval(checkSession, 60 * 60 * 1000); // 1 jam
        return () => clearInterval(intervalId);
    }, [checkSession]);

    // Pemanggilan useEffect untuk mengambil data user saat komponen dimuat
    useEffect(() => {
        if (!localStorage.getItem("login_token")) {
            window.location.replace("/login");
        } else {
            fetchUserData();
        }
    }, [fetchUserData]);

    // Mengatur tampilan berdasarkan state userData
    return !userData ? (
        <Loading />
    ) : (
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-6 relative text-white px-6">
            <img
                src="/frontend/Icons/elipse.svg"
                alt="elipse"
                className="w-full min-h-fit absolute z-[1] left-0 top-[-30px]"
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
                            src={userData?.img_location || "/frontend/img/default_profile.jpg"}
                            alt="photo_profile"
                            id="photo_profile"
                            className="size-12 rounded-full bg-white cursor-pointer"
                            onClick={() => {
                                document.getElementById("my_modal_1").showModal();
                            }}
                        />
                        <dialog id="my_modal_1" className="modal">
                            <div className="modal-box">
                                <img
                                    src={userData?.img_location || "/frontend/img/default_profile.jpg"}
                                    alt="User Profile"
                                    className="w-full"
                                />
                                <div className="modal-action">
                                    <form method="dialog">
                                        <button className="btn">Close</button>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                        <p className="font-semibold text-sm">
                            {userData?.nama_lengkap || "Guest"}
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
                            <img src="/frontend/img/news.png" alt="News" />
                            <img src="/frontend/img/news.png" alt="News" />
                            <img src="/frontend/img/news.png" alt="News" />
                            <img src="/frontend/img/news.png" alt="News" />
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
                                            {userData?.hadir || 0}
                                        </p>
                                    </div>
                                    <h4 className="text-center text-xs font-bold text-primary-md">
                                        Hadir
                                    </h4>
                                </div>
                                <div id="izin" className="w-24">
                                    <div className="mx-auto bg-secondary-yellow size-[50px] rounded-full p-[10px]">
                                        <p className="text-center text-lg font-bold">
                                            {userData?.tidak_hadir || 0}
                                        </p>
                                    </div>
                                    <h4 className="text-center text-xs font-bold text-primary-md">
                                        Izin / Sakit
                                    </h4>
                                </div>
                                <div id="terlambat" className="w-24">
                                    <div className="mx-auto bg-secondary-red size-[50px] rounded-full p-[10px]">
                                        <p className="text-center text-lg font-bold">
                                            {userData?.terlambat_pulang_cepat || 0}
                                        </p>
                                    </div>
                                    <h4 className="text-center text-xs font-bold text-primary-md">
                                        Terlambat
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <SideMenu show={show} setShow={setShow} />
        </div>
    );
};

export default Home;