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
<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-6 relative text-white px-6">
  {/* Background Elipse */}
  <img
    src="/frontend/Icons/elipse.svg"
    alt="elipse"
    className="w-full min-h-fit absolute z-[1] left-0 top-[-30px]"
  />
  
  <div id="core" className="relative z-[2] size-full">
    {/* Header Navigation */}
    <nav className="flex items-center justify-between">
      <button onClick={() => setShow(true)}>
        <Bars3Icon className="fill-white size-8 hover:opacity-80 transition-opacity" />
      </button>
      <div id="profile" className="flex items-center gap-3">
        <img
          src={userData?.img_location || "/frontend/Icons/profile.svg"}
          alt="photo_profile"
          id="photo_profile"
          className="size-12 rounded-full bg-white cursor-pointer border-2 border-primary-md hover:scale-105 transition-transform"
          onClick={() => document.getElementById("my_modal_1").showModal()}
        />
      </div>
      <Link to="/notifikasi">
        <BellIcon className="fill-white size-8 hover:opacity-80 transition-opacity" />
      </Link>
    </nav>

    {/* Main Content */}
    <main className="mt-8 h-56 sm:h-52">
      {/* News Carousel */}
      <div id="news" className="relative size-full mb-4">
        <Carousel className="drop-shadow-[4px_4px_2px_rgba(0,0,0,0.5)] rounded-lg hover:shadow-lg transition-shadow">
          <img src="/frontend/img/news.png" alt="slide_1" />
          <img src="/frontend/img/news.png" alt="slide_2" />
          <img src="/frontend/img/news.png" alt="slide_3" />
          <img src="/frontend/img/news.png" alt="slide_4" />
        </Carousel>
      </div>

      {/* Rekapan Presensi */}
      <div id="rekap" className="bg-white h-40 rounded-2xl px-4 py-3 shadow-md flex flex-col items-center justify-center mb-4">
        <h3 className="text-primary-md font-bold text-base mb-4">
          Rekapan Presensi (Bulan Ini)
        </h3>
        <div className="flex justify-center w-full px-6 gap-6">
          {['hadir', 'tidak_hadir', 'terlambat_pulang_cepat'].map((key, index) => (
            <div
              key={key}
              className="w-24 flex flex-col items-center gap-2"
            >
              <div
                className={`size-[50px] rounded-full p-[10px] flex items-center justify-center ${
                  index === 0
                    ? 'bg-secondary-green'
                    : index === 1
                    ? 'bg-secondary-yellow'
                    : 'bg-secondary-red'
                }`}
              >
                <p className="text-center text-lg font-bold">
                  {userData?.[key] || 0}
                </p>
              </div>
              <h4 className="text-center text-xs font-bold text-primary-md mt-2">
                {index === 0 ? 'Hadir' : index === 1 ? 'Izin / Sakit' : 'Terlambat'}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* Navigasi Presensi */}
      <div className="bg-white w-full h-fit rounded-2xl px-4 py-3 flex flex-col gap-3 shadow-md">
        {[
          {
            id: 'presensi',
            link: localStorage.getItem("group_id") === "4" ? "/presensi" : "/presensi/staff",
            icon: <CheckCircleIcon className="size-6" />, 
            text: 'Presensi',
          },
          {
            id: 'riwayat_presensi',
            link: '/riwayat',
            icon: <ClockIcon className="size-6" />,
            text: 'Riwayat Presensi',
          },
        ].map(({ id, link, icon, text }) => (
          <Link
            key={id}
            id={id}
            to={link}
            className="flex items-center gap-3 p-4 border border-primary-low rounded-lg hover:shadow-lg hover:border-primary-md transition-all duration-300"
          >
            <div className="size-10 bg-primary-md rounded-full flex justify-center items-center">
              {icon}
            </div>
            <p className="text-primary-md font-bold text-sm">{text}</p>
            <ChevronRightIcon className="ml-auto size-4 stroke-bg-3" />
          </Link>
        ))}
      </div>
    </main>
  </div>

  {/* Side Menu */}
  <SideMenu show={show} setShow={setShow} userData={userData} />
</div>
  );
};

export default Home;
