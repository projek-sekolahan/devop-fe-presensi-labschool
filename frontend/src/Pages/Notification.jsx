import { Link } from "react-router-dom";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import apiXML from "../utils/apiXML.js";
import { getFormData, parseJwt, addDefaultKeys } from "../utils/utils";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Cookies from "js-cookie";
import { Tabs } from "flowbite-react";

function CardNotifikasi({ datas }) {
  if (datas.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
          <h4 className="text-lg font-semibold">Warning</h4>
        </div>
        <p className="mt-2 text-sm">Tidak ada data notifikasi yang tersedia. Harap coba lagi nanti.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {datas.map((data, i) => (
        <div className="card-notification" key={i}>
          <div className="flex flex-col justify-center">
            <h4 className="font-semibold text-[12px] text-primary-low">
              {data.category.replace(/\b\w/g, (char) => char.toUpperCase())}
              <span className="text-bg-3 ml-3 opacity-50">{data.created_at.slice(10, 16)}</span>
            </h4>
            <h4 className="font-semibold text-[12px]">{data.title}</h4>
            <p className="text-bg-3 font-light text-[10px] text-justify">{data.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Notification() {
  const [allData, setAllData] = useState([]); // Simpan semua data hasil fetch
  const [data, setData] = useState([]); // Data yang akan ditampilkan
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(["Semua"]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const { ref, inView } = useInView();

  const fetchNotifications = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const keys = ["AUTH_KEY", "token"];
    const combinedKeys = addDefaultKeys(keys);
    const values = [
      localStorage.getItem("AUTH_KEY"),
      localStorage.getItem("login_token"),
      localStorage.getItem("devop-sso"),
      Cookies.get("csrf"),
    ];

    try {
      const res = await apiXML.notificationsPost(
        "detail",
        localStorage.getItem("AUTH_KEY"),
        getFormData(combinedKeys, values)
      );
      const parsedRes = JSON.parse(res);
      Cookies.set("csrf", parsedRes.csrfHash);

      if (!parsedRes || !parsedRes.data) {
        console.warn("Invalid response:", parsedRes);
        setHasMore(false);
        return;
      }

      const response = parseJwt(parsedRes.data.token);

      // Mengambil semua data notifikasi
      const allNotifications = Object.values(
        Object.fromEntries(
          Object.entries(response).filter(([key, value]) => Array.isArray(value) && key !== "category")
        )
      ).flat();

      if (!Array.isArray(allNotifications) || allNotifications.length === 0) {
        console.warn("Filtered data is empty or not an array:", allNotifications);
        setHasMore(false);
        return;
      }

      const newData = allNotifications.slice((page - 1) * 10, page * 10);
      const allCategories = ["Semua", ...new Set(response.category)];

      setAllData((prevData) => [...prevData, ...allNotifications]); // Simpan semua data
      setCategories(allCategories);
      setHasMore(newData.length === 10);
      setPage(page + 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data pertama kali saat halaman dimuat
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Load data tambahan saat scroll ke bawah
  useEffect(() => {
    if (inView) {
      fetchNotifications();
    }
  }, [inView]);

  // **Gunakan useEffect untuk filter tanpa fetch ulang**
  useEffect(() => {
    if (activeCategory === "Semua") {
      setData(allData);
    } else {
      setData(allData.filter((item) => item.category === activeCategory));
    }
  }, [activeCategory, allData]);

  return (
    <div className="notification-container h-screen flex flex-col overflow-y-auto">
      <header>
        <Link to="/home">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </Link>
        <h1 className="notification-section-container">Notifikasi</h1>
      </header>
      <main className="w-full min-h-screen relative px-8 text-black flex flex-col gap-4 overflow-y-auto">
                <div className="custom-card">
                  <Tabs
                    aria-label="Tabs Notifikasi"
                    onActiveTabChange={(tabIndex) => setActiveCategory(categories[tabIndex])}
                  >
                    {categories.map((category) => (
                      <Tabs.Item key={category} title={category.replace(/\b\w/g, char => char.toUpperCase())}>  
                      {loading && allData.length === 0 ? (
                        <div className="flex justify-center items-center">
                          <span className="loading loading-spinner text-white"></span>
                        </div>
                      ) : (
                        <CardNotifikasi datas={data} />
                      )}
                      </Tabs.Item>
                    ))}
                  </Tabs>
                </div>
        <div ref={ref}></div>
      </main>
    </div>
  );
}