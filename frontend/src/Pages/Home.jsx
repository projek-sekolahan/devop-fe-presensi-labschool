import { useState, useEffect, useCallback } from "react";
import { parseJwt, getFormData, handleSessionExpired, addDefaultKeys, getCombinedValues } from "../utils/utils";
import ApiService from "../utils/ApiService.js";
import { Link } from "react-router-dom";
import { FaBars, FaBell, FaPersonCircleCheck, FaCalendarCheck } from "react-icons/fa6";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Carousel } from "flowbite-react";
import SideMenu from "../Components/SideMenu.jsx";
import Profile from "../Pages/Profile.jsx";
import Cookies from "js-cookie";
import Loading from "../Components/Loading";

// Constants for keys
const AUTH_KEYS = ["AUTH_KEY", "token"];
const TOKEN_KEYS = ["AUTH_KEY", "token_fcm", "token"];

const Home = ({ intervalId }) => {
  const [showMenu, setShowMenu] = useState(false); // Untuk SideMenu
  const [showProfile, setShowProfile] = useState(false); // Untuk Profile
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const closeMenu = () => setShowMenu(false);
  const closeProfile = () => setShowProfile(false);
  
  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const values = getCombinedValues(AUTH_KEYS);
      const response = await ApiService.processApiRequest("users/profile", getFormData(addDefaultKeys(AUTH_KEYS), values), values[0], false);
      if (response?.data) {
        localStorage.setItem("token", response.data.token);
        const user = parseJwt(response.data.token);
        localStorage.setItem("group_id", user.group_id);
        setUserData(user);
        if (Cookies.get("token_registered")==false || Cookies.get("token_registered")=="false") {
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
  const registerToken = async () => {
    const values = getCombinedValues(TOKEN_KEYS);
    const response = await ApiService.processApiRequest("notifications/registerToken", getFormData(addDefaultKeys(TOKEN_KEYS), values), values[0], false);
    if (response) {
      Cookies.set("token_registered", "true");
      Cookies.set("cookiesAccepted", "true");
    }
  };

  // useEffect untuk mengambil data pengguna
  useEffect(() => {
    if (!localStorage.getItem("login_token")) {
      window.location.replace("/login");
    } else {
      fetchUserData();
    }
  }, [fetchUserData]);

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
    <div className="home-container pt-6 px-6">
      <div id="core" className="relative z-[2] size-full">
        {/* Header Navigation */}
        <nav>
          <button onClick={() => { setShowMenu(true) }}>
            <FaBars className="fill-white size-8 hover:opacity-80 transition-opacity" />
          </button>
          <div id="profile" className="flex items-center gap-3">
            <Link to="/notifikasi">
              <FaBell className="fill-white size-8 hover:opacity-80 transition-opacity" />
            </Link>
            <button onClick={() => { setShowProfile(true) }}>
              <img
                src={userData?.img_location || "/frontend/Icons/profile.svg"}
                alt="photo_profile"
                id="photo_profile"
                className="size-12 rounded-full border-2 border-primary-md transition-opacity"
              />
            </button>
          </div>
        </nav>
      {/* News Layer */}
      <div id="news">
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
        {/* Main Content */}
        <main id="fixed-main">
          {/* Rekapan dan Navigasi Presensi */}
          <div id="rekap">
            {/* Rekapan Presensi */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-primary-md font-bold text-base mb-4">
                Rekapan Presensi (Bulan Ini)
              </h3>
              <div className="flex justify-center w-full px-6 gap-6">
                {["hadir", "tidak_hadir", "tidak_normal"].map((key, index) => (
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
                    <h4 className="heading-small">
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
                  className="link-container"
                >
                  <div className="link-icon">
                    {icon}
                  </div>
                  <p className="link-text">{text}</p>
                  <ChevronRightIcon className="link-chevron" />
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
      {/* Side Menu */}
      <SideMenu showMenu={showMenu} userData={userData} closeMenu={closeMenu} intervalId={intervalId} />
      {/* Profile Info */}
      <Profile showProfile={showProfile} userData={userData} closeProfile={closeProfile} />
    </div>
  );
};
export default Home;