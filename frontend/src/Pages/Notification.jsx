import { Link } from "react-router-dom";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import apiXML from "../utils/apiXML.js";
import { getFormData, parseJwt, addDefaultKeys } from "../utils/utils";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Cookies from "js-cookie";

function CardNotifikasi({ datas }) {
  const dataArray = Object.keys(datas)
    .filter((key) => !isNaN(key)) // Filter hanya properti numerik
    .map((key) => datas[key]);

  // Periksa apakah array hasil konversi kosong
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
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

  // Render data notifikasi
  return (
    <div className="flex flex-col gap-4">
      {dataArray.map((data, i) => {
        const createdAt = data?.created_at || "";
        const category = data?.category || "notifikasi";
        const message = data?.message || "Tidak ada pesan";

        return (
          <div className="card-notification" key={i}>
            <div className="flex flex-col justify-center">
              {category !== "notifikasi" ? (
                <>
                  <h4 className="font-semibold text-[12px] text-primary-low inline">
                    Berita
                    <span className="text-bg-3 ml-3 opacity-50">{createdAt.slice(10, 16)}</span>
                  </h4>
                  <h4 className="font-semibold text-[12px]">{data.title || "Judul tidak tersedia"}</h4>
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-[12px] text-primary-low">
                    Notifikasi
                    <span className="text-bg-3 ml-3 opacity-50">{createdAt.slice(10, 16)}</span>
                  </h4>
                  <h4
                    className={`font-semibold text-[12px] ${
                      data.title === "Presensi Berhasil" ? "text-secondary-green" : "text-secondary-red"
                    }`}
                  >
                    {data.title || "Presensi Gagal!"}
                  </h4>
                </>
              )}
              <p className="text-bg-3 font-light text-[10px] text-justify">{message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Notification() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
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
  
      console.log("Raw Response:", res);
      const parsedRes = JSON.parse(res);
      Cookies.set("csrf", parsedRes.csrfHash);
  
      if (!parsedRes || typeof parsedRes !== "object") {
        console.warn("Invalid response format:", parsedRes);
        setHasMore(false);
        return;
      }
  
      if (!parsedRes.data) {
        console.warn("No 'data' property found in response:", parsedRes);
        setHasMore(false);
        return;
      }
  
      const response = parseJwt(parsedRes.data.token);
      console.log("Parsed Response:", response);
  
      if (!response || typeof response !== "object") {
        console.warn("Invalid response data:", response);
        setHasMore(false);
        return;
      }
  
      // **Gunakan Object.values untuk mengambil array dari properti numerik**
      const filteredData = Object.values(response).filter((item) => typeof item === "object");
      console.log("Filtered Response (Before Slice):", filteredData);
  
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        console.warn("Filtered data is empty or not an array:", filteredData);
        setHasMore(false);
        return;
      }
  
      const newData = filteredData.slice((page - 1) * 10, page * 10);
      console.log("New Data (After Slice):", newData);
  
      setData((prevData) => [...prevData, ...newData]);
      setHasMore(newData.length === 10);
      setPage(page + 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };   

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (inView) {
      fetchNotifications();
    }
  }, [inView]);

  return (
    <div className="notification-container h-screen flex flex-col overflow-y-auto">
      <header>
        <Link to="/home">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </Link>
        <h1 className="notification-section-container">Notifikasi</h1>
      </header>
      <main className="w-full min-h-screen relative px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
        <div className="custom-card">
          {loading ? (
            <div className="size-full flex justify-center items-center">
              <span className="loading loading-spinner text-white"></span>
            </div>
          ) : (
            <CardNotifikasi datas={data} />
          )}
        </div>
        <div ref={ref}></div>
      </main>
    </div>
  );
}