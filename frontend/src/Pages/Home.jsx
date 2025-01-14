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
// import "../App.css";

// Constants for keys
const AUTH_KEYS = ["AUTH_KEY", "token"];
const SESSION_KEYS = ["AUTH_KEY"];
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

const Home = () => {
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
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
        message: error?.message || "Error saat mengambil data pengguna",
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

  // Check session
  const checkSession = useCallback(async () => {
    try {
      const values = getCombinedValues(SESSION_KEYS);
      
      const res = await apiXML.authPost(
        "sesstime",
        values[0],
        getFormData(addDefaultKeys(SESSION_KEYS), values)
      );
      const parsedRes = JSON.parse(res);

      if (parsedRes.data.title === "Your Session OK") {
        Cookies.set("csrf", parsedRes.csrfHash);
      } else {
        handleSessionExpired(parsedRes.data);
      }
    } catch (err) {
      handleSessionExpired({
        title: "Session Timeout",
        message: err?.message || "Error saat memeriksa sesi",
      });
    }
  }, []);

  // useEffect untuk memeriksa sesi pengguna
  useEffect(() => {
    const id = setInterval(checkSession, 1800000);
    setIntervalId(id);  // Simpan intervalId dalam state
    return () => clearInterval(id);
  }, [checkSession]);

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

<div className="home-container">
  {/* Background Color */}
  
  {/* Header Navigation */}
  <header className="header-navigation">
    <h1>Header Navigation</h1>
  </header>

  <main className="home-form-container">
    {/* Carousel */}
    <div className="carousel">
      <h2>Carousel</h2>
    </div>

    {/* Rekapan Presensi */}
    <div className="rekapan-presensi">
      <h3>Rekapan Presensi</h3>
    </div>

    {/* Navigasi Presensi */}
    <div className="navigasi-presensi">
      <h3>Navigasi Presensi</h3>
    </div>
  </main>
</div>


  );
};
export default Home;