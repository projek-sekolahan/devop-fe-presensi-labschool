import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { ExclamationTriangleIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import Layout from "../Components/Layout";
import { getFormData, handleSessionError, formatDate } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";

const STATUS_COLORS = {
    "Normal": "bg-green-500 text-white",
    "Hadir": "bg-green-500 text-white",
    "Tidak Normal": "bg-red-500 text-white",
    "Dinas Luar": "bg-gray-600 text-white",
    "Izin/Sakit": "bg-yellow-500 text-black",
};

const getStatusLabel = (history) => { console.log("history keterangan", history)
    if (history.keterangan === "Dinas Luar") {
        return "Dinas Luar";
    }
    if (history.keterangan === "Masuk Normal" && history.keterangan === "Pulang Normal") {
        return "Normal";
    }
    if (history.keterangan === "Terlambat Masuk" || history.keterangan === "Pulang Cepat" || 
        history.keterangan === "---" || history.keterangan === "---") {
        return "Tidak Normal";
    }
    return "Izin/Sakit";
};

export default function Kehadiran() {
    const [historyData, setHistoryData] = useState([]);
    const [cardLoading, setCardLoading] = useState(true);
    const [localLoading, setLocalLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const prevHistoryData = useRef(null);

    // Mendapatkan CSRF Token
    apiXML.getCsrf();

    // Redirect if no id
    useEffect(() => {
        console.log("ID dari useParams:", id);
        if (id === undefined) return;

        if (!id) {
            navigate("*");
            return;
        } else {
            setCardLoading(false);
            setLocalLoading(false);
        }
    }, [id, navigate]);

    // Fetch history data with error handling
    const fetchHistory = useCallback(async () => {
        if (!id) return;
        setCardLoading(true);
        setLocalLoading(true);
        const keys = ["csrf_token", "token"];
        const values = keys.map((key) => {
            switch (key) {
                case "csrf_token":
                    return Cookies.get("csrf");
                case "token":
                    return id;
                default:
                    return null;
            }
        });

        try {
            const res = await apiXML.postInput("reports", getFormData(keys, values));
            const parsedData = JSON.parse(res); console.log("Data presensi ditemukan:", parsedData.data.data);
            Cookies.set("csrf", parsedData.csrfHash);
            if ( parsedData.data.data && Array.isArray( parsedData.data.data.result)) {
                if (JSON.stringify(historyData) !== JSON.stringify(parsedData.data.data)) {
                    setHistoryData(parsedData.data.data);
                }
            } else {
                console.warn("Data result tidak ditemukan atau bukan array");
                setHistoryData([]);
            }
            // setHistoryData(Array.isArray(parsedData.data.result) ? parsedData.data : []);
            // historyData.map((history, i) => { console.log(history) });
        } catch (err) {
            const errorResponse = err.response ? JSON.parse(err.responseText) : err;
            handleSessionError(errorResponse, "*");
        } finally {
            setCardLoading(false);
            setLocalLoading(false);
        }

    }, [id]);

    useEffect(() => {
        fetchHistory(); // Pastikan data di-fetch saat komponen pertama kali dimuat
    }, [id]);
    
    useEffect(() => {
        if (JSON.stringify(prevHistoryData.current) !== JSON.stringify(historyData)) {
            console.log("State historyData saat ini:", historyData);
            prevHistoryData.current = historyData;
        }
        /* if (historyData?.result?.length > 0) {
            console.log("State historyData saat ini:", historyData);
        } */
    }, [historyData]);    

console.log("State historyData saat ini:", historyData);
console.log("Tipe historyData:", typeof historyData.result);
console.log("Apakah historyData array?", Array.isArray(historyData.result));

    return (
        <div className="history-container h-screen flex flex-col overflow-y-auto">
            <Layout link="*" label="Presensi Kehadiran">
                <div className="custom-card mt-10">
                    {(cardLoading || localLoading) ? (
                        <LoadingPlaceholder />
                    ) : (
                        <>
                            {historyData?.result?.length > 0 ? (
                                <HistoryList historyData={historyData} />
                            ) : (
                                <NoDataMessage />
                            )}
                        </>
                    )}
                </div>
            </Layout>
        </div>
    );
}

const LoadingPlaceholder = () => (
    <div className="animate-pulse bg-white h-32 w-full rounded-md"></div>
);

const HistoryList = ({ historyData }) => (
    <AnimatePresence>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.2 } }
            }}
            className="flex flex-col gap-4"
        >
        <div className="flex flex-col rounded-lg p-4 shadow-md w-full max-w-md mx-auto bg-white">
            {/* Card Utama */}
            <div className="flex flex-col items-center border-b pb-3">
                <img
                    src={historyData.img_location}
                    alt="Foto Profil"
                    className="w-20 h-20 rounded-full border-2 border-gray-300"
                />
                <p className="font-semibold text-lg mt-2 text-center">
                    {historyData.nama_lengkap}
                </p>
            </div>

            {/* Card Anak */}
            {historyData?.result?.map((history, i) => {
                const statusLabel = getStatusLabel(history);
                return (
                    <motion.div
                        key={i}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col mt-3 shadow-sm rounded-lg bg-gray-100 p-2">
                            <div className="flex items-center gap-3">
                                <img
                                    src={history.foto_presensi}
                                    alt="Foto Presensi"
                                    className="w-14 h-14 rounded-lg border border-gray-300"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                                        <CalendarIcon className="w-4 h-4" />
                                        <p>{formatDate(history.tanggal_presensi)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                                        <ClockIcon className="w-4 h-4" />
                                        <p>{history.waktu_presensi}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Footer Status */}
                            <div
                                className="w-full text-center mt-3 px-4 py-2 rounded-lg font-medium text-sm"
                                style={{ backgroundColor: STATUS_COLORS[statusLabel] }}
                            >
                                {statusLabel}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>        
        </motion.div>
    </AnimatePresence>
);

const NoDataMessage = () => (
    <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
            <h4 className="text-lg font-semibold">Warning</h4>
        </div>
        <p className="mt-2 text-sm">Tidak ada data kehadiran presensi yang tersedia. Harap coba lagi nanti.</p>
    </div>
);