import { Link } from "react-router-dom";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import apiXML from "../utils/apiXML.js";
import { getFormData, parseJwt, addDefaultKeys } from "../utils/utils";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import Cookies from "js-cookie";

function CardNotifikasi({ datas }) {
  return (
    <div className="flex flex-col gap-4">
      {datas.map((data, i) => {
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
  const [load, setLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const fetchNotifications = useCallback(async () => {
    if (!hasMore) return;
    setLoad(true);

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
      
      if (parsedRes && parsedRes.data) {
        const response = parseJwt(parsedRes.data.token);
        setData((prevData) => [...prevData, ...response.slice((page - 1) * 10, page * 10)]);
        setHasMore(response.length > page * 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setHasMore(false);
    } finally {
      setLoad(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore]);

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
          {data.length === 0 && !load ? (
            <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                <h4 className="text-lg font-semibold">Warning</h4>
              </div>
              <p className="mt-2 text-sm">Tidak ada data notifikasi yang tersedia.</p>
            </div>
          ) : (
            <CardNotifikasi datas={data} />
          )}
          {load && <div className="size-full flex justify-center items-center"><span className="loading loading-spinner text-white"></span></div>}
          <div ref={ref} className="h-10" />
        </div>
      </main>
    </div>
  );
}
