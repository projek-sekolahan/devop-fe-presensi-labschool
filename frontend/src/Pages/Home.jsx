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

const Home = () => {
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState(null); // Menyimpan data pengguna
  const [loading, setLoading] = useState(true); // Status loading
  const [error, setError] = useState(null); // Status error
  const navigate = useNavigate();

  // Fungsi untuk mengambil data pengguna
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true); // Aktifkan loading
      const keys = ["AUTH_KEY", "login_token"];
      const combinedKeys = addDefaultKeys(keys);
      alert("masuk homepage");
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
      console.log("API Response:", res);
      if (res?.data) {
        // Simpan token dan csrf baru
        localStorage.setItem("token", res.data.token);
        Cookies.set("csrf", res.csrfHash);

        // Parse token untuk mendapatkan data user
        const user = parseJwt(res.data.token);
        localStorage.setItem("group_id", user.group_id);
        console.log("Parsed User Data:", user);
        setUserData(user); // Set state userData
      } else {
        alertMessage("error", "No data in API response", "err");
      }
    } catch (error) {
      console.error("Error saat mengambil data pengguna:", error);
      handleSessionError(error, "/login");
    } finally {
      setLoading(false); // Matikan loading
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

  // useEffect untuk memeriksa sesi pengguna setiap 1 jam
  useEffect(() => {
    const intervalId = setInterval(checkSession, 60 * 60 * 1000); // 1 jam
    return () => clearInterval(intervalId);
  }, [checkSession]);

  // useEffect untuk mengambil data pengguna saat komponen di-mount
  useEffect(() => {
    if (!localStorage.getItem("login_token")) {
      window.location.replace("/login");
    } else {
      fetchUserData();
    }
  }, [fetchUserData]);

  // Debug perubahan state userData
  useEffect(() => {
    console.log("UserData State Updated:", userData);
  }, [userData]);

  // Render loading atau error
    if (loading) return <Loading />;
    if (!userData) return <p>Data pengguna tidak tersedia.</p>;

  // Render komponen utama
  return (
<div className="bg-gradient-to-br from-purple-500 to-indigo-600 font-sans flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-6 relative text-white px-6">
  <img
    src="/frontend/Icons/elipse.svg"
    alt="elipse"
    className="w-full min-h-fit absolute z-[1] left-0 top-[-30px] opacity-50"
  />
  <div id="core" className="relative z-[2] size-full">
    <nav className="flex items-center justify-between pb-4 border-b border-white/30">
      <button onClick={() => setShow(true)} className="hover:scale-110 transition-transform">
        <Bars3Icon className="fill-white size-8" />
      </button>
      <div id="profile" className="flex items-center gap-3">
        <img
          src={userData?.img_location || "/frontend/Icons/profile.svg"}
          alt="photo_profile"
          id="photo_profile"
          className="size-12 rounded-full bg-white cursor-pointer border-2 border-indigo-400 hover:shadow-lg transition-shadow"
          onClick={() =>
            document.getElementById("my_modal_1").showModal()
          }
        />
        <dialog id="my_modal_1" className="modal w-[90%] max-w-md rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white">
          <div className="modal-box flex flex-col items-center gap-4">
            <img
              src={userData?.img_location || "/frontend/Icons/profile.svg"}
              alt="User Profile"
              className="rounded-full w-24 shadow-md border-4 border-white"
            />
            <h2 className="text-lg font-bold">{userData?.nama_lengkap || "Guest"}</h2>
            <button className="btn bg-indigo-500 w-full hover:bg-indigo-600 text-white">Edit Profile</button>
            <div className="modal-action">
              <button className="btn bg-purple-500 w-full hover:bg-purple-600 text-white">Close</button>
            </div>
          </div>
        </dialog>
        <p className="font-semibold text-sm text-indigo-200">
          {userData?.nama_lengkap || "Guest"}
        </p>
      </div>
      <Link to="/notifikasi" className="relative hover:scale-110 transition-transform">
        <BellIcon className="fill-white size-8" />
      </Link>
    </nav>
    <main className="mt-8 h-56 sm:h-52">
      <div id="news" className="relative size-full">
        <Carousel className="rounded-xl drop-shadow-lg">
          <img src="/frontend/img/news.png" alt="slide_1" className="rounded-xl" />
          <img src="/frontend/img/news.png" alt="slide_2" className="rounded-xl" />
          <img src="/frontend/img/news.png" alt="slide_3" className="rounded-xl" />
          <img src="/frontend/img/news.png" alt="slide_4" className="rounded-xl" />
        </Carousel>
        <div
          id="rekap"
          className="bg-white/10 h-48 mt-5 rounded-2xl px-4 py-3 shadow-lg flex flex-col items-center justify-center text-white"
        >
          <h3 className="text-indigo-200 font-bold text-base mb-4">
            {"Rekapan Presensi (Bulan Ini)"}
          </h3>
          <div className="flex justify-center w-full px-6 gap-6">
            <div id="hadir" className="w-24 flex flex-col items-center gap-2">
              <div className="bg-green-500 size-[50px] rounded-full p-[10px] flex items-center justify-center shadow">
                <p className="text-center text-lg font-bold">
                  {userData?.hadir || 0}
                </p>
              </div>
              <h4 className="text-center text-xs font-bold text-indigo-200 mt-2">
                Hadir
              </h4>
            </div>
            <div id="izin" className="w-24 flex flex-col items-center gap-2">
              <div className="bg-yellow-500 size-[50px] rounded-full p-[10px] flex items-center justify-center shadow">
                <p className="text-center text-lg font-bold">
                  {userData?.tidak_hadir || 0}
                </p>
              </div>
              <h4 className="text-center text-xs font-bold text-indigo-200 mt-2">
                Izin / Sakit
              </h4>
            </div>
            <div id="terlambat" className="w-24 flex flex-col items-center gap-2">
              <div className="bg-red-500 size-[50px] rounded-full p-[10px] flex items-center justify-center shadow">
                <p className="text-center text-lg font-bold">
                  {userData?.terlambat_pulang_cepat || 0}
                </p>
              </div>
              <h4 className="text-center text-xs font-bold text-indigo-200 mt-2">
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
          className="bg-white/20 w-full h-fit mt-4 rounded-2xl px-4 py-3 flex gap-3 items-center shadow-lg hover:scale-105 transition-transform"
        >
          <div className="size-10 bg-indigo-500 rounded-full flex justify-center items-center">
            <CheckCircleIcon className="size-6" />
          </div>
          <p className="text-indigo-200 font-bold text-sm">Presensi</p>
          <ChevronRightIcon className="absolute size-4 stroke-white right-10" />
        </Link>
        <Link
          id="riwayat_presensi"
          to="/riwayat"
          className="bg-white/20 w-full h-fit mt-4 rounded-2xl px-4 py-3 flex gap-3 items-center shadow-lg hover:scale-105 transition-transform"
        >
          <div className="size-10 bg-indigo-500 rounded-full flex justify-center items-center">
            <ClockIcon className="size-6" />
          </div>
          <p className="text-indigo-200 font-bold text-sm">Riwayat Presensi</p>
          <ChevronRightIcon className="absolute size-4 stroke-white right-10" />
        </Link>
      </div>
    </main>
  </div>
  <SideMenu
    show={show}
    setShow={setShow}
    userData={userData}
    className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-br from-purple-700 to-indigo-800 text-white transform ${
      show ? "translate-x-0" : "-translate-x-full"
    } transition-transform shadow-xl`}
  />
</div>
  );
};

export default Home;
