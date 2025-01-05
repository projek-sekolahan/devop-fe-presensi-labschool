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
import { FaBars, FaBell, FaPersonCircleCheck, FaCalendarCheck } from "react-icons/fa6";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Carousel } from "flowbite-react";
import SideMenu from "/src/Components/SideMenu";
import Cookies from "js-cookie";
import Loading from "../Components/Loading";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getMessaging,
    getToken,
    onMessage,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";

const Home = () => {
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState(null); // Menyimpan data pengguna
  const [loading, setLoading] = useState(true); // Status loading
  const navigate = useNavigate();

  const closeMenu = () => {
    setShow(false); // Menutup side menu
  };

  // Fungsi untuk mengambil data pengguna
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true); // Aktifkan loading
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
      console.log("API Response:", res);
      
      if (res?.data) {
        // Simpan token dan csrf baru
        localStorage.setItem("token", res.data.token);
        Cookies.set("csrf", res.csrfHash);
        alert("masuk homepage");
        // Parse token untuk mendapatkan data user
        const user = parseJwt(res.data.token);
        localStorage.setItem("group_id", user.group_id);
        console.log("Parsed User Data:", user);
        setUserData(user); // Set state userData
      } else {
        alertMessage("No data in API response", "err", "error");
      }
    } catch (error) {
      alertMessage("Error saat mengambil data", error, "error");
      console.error("Error saat mengambil data pengguna:", error);
      handleSessionError(error, "/login");
    } finally {
      setLoading(false); // Matikan loading
    }
  }, []);

  // Fungsi untuk memeriksa sesi pengguna
  /* const checkSession = useCallback(async () => {
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
  }, []); */

  // useEffect untuk memeriksa sesi pengguna setiap 1 jam
  /* useEffect(() => {
    const intervalId = setInterval(checkSession, 60 * 60 * 1000); // 1 jam
    return () => clearInterval(intervalId);
  }, [checkSession]); */

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

  // Konfigurasi Firebase
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  useEffect(() => {
        if (!localStorage.getItem("token_registered")) {
            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            // Kirim konfigurasi ke Service Worker
            if ("serviceWorker" in navigator) {
              // Periksa apakah firebaseConfig sudah terdefinisi
              if (typeof firebaseConfig === 'undefined' || !firebaseConfig) {
                console.error("firebaseConfig belum terdefinisi. Pastikan konfigurasi Firebase sudah benar.");
                return;
              }
              
              navigator.serviceWorker
                .register("/firebase-messaging-sw.js", { scope: "/" })
                .then((registration) => {
                  console.log("Service Worker berhasil didaftarkan:", registration.scope);

                    // Menunggu service worker siap
                    navigator.serviceWorker.ready
                    .then((registration) => {
                        if (registration.active) {
                            // Kirim pesan untuk inisialisasi Firebase
                            registration.active.postMessage({
                                type: "INIT_FIREBASE",
                                config: firebaseConfig,
                            });
                        } else {
                            console.error("Service Worker tidak aktif.");
                        }
                    })
                    .catch((err) => {
                        console.error("Error saat menunggu Service Worker siap:", err);
                    });

                })
                .catch((err) => {
                  console.error("Pendaftaran Service Worker gagal:", err);
                });
            }
            else {
              console.log("Service Worker tidak didukung di browser ini.");
            }

            // Request permission untuk notifikasi
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                alertMessage(
                  "Notification",
                  "Notification permission granted.",
                  "success",
                  () => navigate("/home"),
                );
                getToken(messaging, {
                  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                })
                  .then((currentToken) => {
                    console.log("Token received:", currentToken); return false;
                    if (currentToken) {
                      registerToken(currentToken); // Pastikan fungsi ini berjalan dengan baik.
                    } else {
                      console.error("Failed to generate token.");
                    }
                  })
                  .catch((error) => {
                    console.error("Error getting token:", error);
                    /* alertMessage(
                      "Notification",
                      "Terjadi kesalahan saat mendapatkan token. Pastikan izin notifikasi diberikan.",
                      "error",
                      () => navigate("/home"),
                    ), */
                  });
              } else {
                alertMessage(
                  "Notification",
                  "Notification permission denied.",
                  "error",
                  () => navigate("/home"),
                );
              }
            });            

            /* onMessage(messaging, (payload) => {
                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                };
                alertMessage(
                    notificationTitle,
                    notificationOptions.body,
                    "success",
                    () => navigate("/home"),
                );
            }); */
        }
    }, []);

    const registerToken = (currentToken) => {
        let keys = ["AUTH_KEY", "login_token", "token_fcm"];
        const combinedKeys = addDefaultKeys(keys);
        localStorage.setItem("token_fcm", currentToken);
        console.log(currentToken); return false;
        apiXML.getCsrf().then((res) => {
            res = JSON.parse(res);
            // Fetch values from localStorage and Cookies
            let values = combinedKeys.map((key) => {
                let value = localStorage.getItem(key);
                if (key === "csrf_token" && !value) {
                    value = res.csrfHash; // Fallback to Cookies if csrf_token is null in localStorage
                }
                if (key === "token_fcm" && !value) {
                    value = currentToken; // Fallback to Cookies if token_fcm is null in localStorage
                }
                return value;
            });
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
                    console.error("Error saat memeriksa regist token:", error);
                    handleSessionError(error, "/login");
                });
        });
    };

    useEffect(() => {
      const carousel = document.querySelector("[data-carousel-touch]");
      if (carousel) {
        carousel.addEventListener("touchstart", (e) => {
          alert("Touch start detected");
        });
      }
    }, []);

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
  <SideMenu show={show} userData={userData} closeMenu={closeMenu}/>
</div>

  );
};
export default Home;