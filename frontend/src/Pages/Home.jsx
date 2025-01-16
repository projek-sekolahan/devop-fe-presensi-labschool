import { useState, useEffect, useCallback } from "react";
import {
  parseJwt,
  getFormData,
  handleSessionExpired,
  addDefaultKeys,
} from "../utils/utils";
import apiXML from "../utils/apiXML.js";
import { Link } from "react-router-dom";
import { FaBars, FaBell, FaPersonCircleCheck, FaCalendarCheck } from "react-icons/fa6";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Carousel } from "flowbite-react";
import SideMenu from "/src/Components/SideMenu";
import Cookies from "js-cookie";
import Loading from "../Components/Loading";

// Constants for keys
const AUTH_KEYS = ["AUTH_KEY", "token"];
const TOKEN_KEYS = ["AUTH_KEY", "token_fcm", "token"];

// Helper function to get combined values from localStorage and Cookies
const getCombinedValues = (keys) => {
  const combinedKeys = addDefaultKeys(keys);
  return combinedKeys.map((key) => {
    let value = localStorage.getItem(key);
    if (key === "csrf_token" && !value) value = Cookies.get("csrf");
    if (key === "token") value = localStorage.getItem("login_token");
    return value;
  });
};

const Home = ({ intervalId  }) => {
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const closeMenu = () => setShow(false);
  
  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const values = getCombinedValues(AUTH_KEYS);
      
      const response = await apiXML.usersPost(
        "profile",
        values[0],
        getFormData(addDefaultKeys(AUTH_KEYS), values)
      );
      const res = JSON.parse(response);

      if (res?.data) {
        
        localStorage.setItem("token", res.data.token);
        Cookies.set("csrf", res.csrfHash);

        const user = parseJwt(res.data.token);
        localStorage.setItem("group_id", user.group_id);
        setUserData(user);

        if (!localStorage.getItem("token_registered")) {
          registerToken();
        }
      } else {
        console.error("No data in API response");
      }
    } catch (error) {
      handleSessionExpired({
        title: "Load Data Profile",
        message: "Error saat mengambil data pengguna",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Register token
  const registerToken = () => {
    const values = getCombinedValues(TOKEN_KEYS);
    
    apiXML
      .notificationsPost("registerToken", values[0], getFormData(addDefaultKeys(TOKEN_KEYS), values))
      .then((response) => {
        const result = JSON.parse(response);
        const datares = parseJwt(result.data.token);
        console.log("data token fcm regist", datares)
        Cookies.set("csrf", result.csrfHash);
        localStorage.setItem("token_registered", "done");
      })
      .catch((error) => {
        handleSessionExpired({
          title: "Register Token",
          message: error?.message || "Gagal mendaftarkan token ke server",
        });
      });
  };

  // useEffect untuk mengambil data pengguna
  useEffect(() => {
    if (!localStorage.getItem("login_token")) {
      window.location.replace("/login");
    } else {
      fetchUserData();
    }
  }, [fetchUserData]);

  window.addEventListener("click", (e) => {
    if (e.pageX > (screen.width * 75) / 100) {
      setShow(false);
    }
  });

  const newsItems = [
    { src: "/frontend/img/news.png", title: "Berita Utama 1" },
    { src: "/frontend/img/news.png", title: "Berita Utama 2" },
    { src: "/frontend/img/news.png", title: "Berita Utama 3" },
    { src: "/frontend/img/news.png", title: "Berita Utama 4" },
    { src: "/frontend/img/news.png", title: "Berita Utama 5" },
  ];

  if (loading || !userData) return <Loading />;

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
        <FaBars className="fill-white size-8 hover:opacity-80 transition-opacity" />
      </button>
      <div id="profile" className="flex items-center gap-3">
      <Link to="/notifikasi">
          <FaBell className="fill-white size-8 hover:opacity-80 transition-opacity" />
        </Link>
        <Link to="/profile">
          <img
            src={userData?.img_location || "/frontend/Icons/profile.svg"}
            alt="photo_profile"
            id="photo_profile"
            className="size-12 rounded-full bg-white cursor-pointer border-2 border-primary-md hover:scale-105 transition-transform"
          />
        </Link>
      </div>
    </nav>

    {/* Main Content */}
    <main className="mt-8 h-fit">
      {/* News Carousel */}
      <div id="news" className="relative w-full h-fit mb-4">
        <Carousel slideInterval={3000} className="rounded-lg shadow-lg" data-carousel-touch>
          {newsItems.map(({ src, title }, index) => (
            <div key={index} className="relative">
              <img src={src} alt={`slide_${index + 1}`} className="w-full h-auto object-cover rounded-lg" />
              <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm p-1 rounded">
                {title}
              </p>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Rekapan dan Navigasi Presensi */}
      <div id="rekap" className="bg-white w-full h-fit rounded-2xl px-4 py-3 shadow-md flex flex-col gap-6">
        {/* Rekapan Presensi */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-primary-md font-bold text-base mb-4">
            Rekapan Presensi (Bulan Ini)
          </h3>
          <div className="flex justify-center w-full px-6 gap-6">
            {["hadir", "tidak_hadir", "terlambat_pulang_cepat"].map((key, index) => (
              <div
                key={key}
                className="w-24 flex flex-col items-center gap-2"
              >
                <div
                  className={`size-[50px] rounded-full p-[10px] flex items-center justify-center ${
                    index === 0
                      ? "bg-secondary-green"
                      : index === 1
                      ? "bg-secondary-yellow"
                      : "bg-secondary-red"
                  }`}
                >
                  <p className="text-center text-lg font-bold">
                    {userData?.[key] || 0}
                  </p>
                </div>
                <h4 className="text-center text-xs font-bold text-primary-md mt-2">
                  {index === 0 ? "Hadir" : index === 1 ? "Izin / Sakit" : "Terlambat"}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Navigasi Presensi */}
        <div className="flex flex-col gap-3">
          {[
            {
              id: "presensi",
              link: localStorage.getItem("group_id") === "4" ? "/presensi" : "/presensi/staff",
              icon: <FaPersonCircleCheck className="size-6" />, 
              text: "Presensi",
            },
            {
              id: "riwayat_presensi",
              link: "/riwayat",
              icon: <FaCalendarCheck className="size-6" />,
              text: "Riwayat Presensi",
            },
          ].map(({ id, link, icon, text }) => (
            <Link
              key={id}
              id={id}
              to={link}
              className="flex items-center gap-3 px-6 py-3 bg-white border border-primary-low rounded-full shadow-md hover:shadow-lg hover:border-primary-md transition-all duration-300"
            >
              <div className="size-10 bg-primary-md text-white rounded-full flex justify-center items-center shadow-sm">
                {icon}
              </div>
              <p className="text-primary-md font-semibold text-sm">{text}</p>
              <ChevronRightIcon className="ml-auto size-4 stroke-bg-3" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  </div>

  {/* Side Menu */}
  <SideMenu show={show} userData={userData} closeMenu={closeMenu} intervalId={intervalId}/>
</div>

  );
};
export default Home;