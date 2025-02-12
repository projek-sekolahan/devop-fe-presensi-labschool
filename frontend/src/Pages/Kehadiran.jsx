import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Layout from "../Components/Layout";
import { getFormData, handleSessionError, formatDate } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { Card, Badge } from "flowbite-react";
import { useParams, useNavigate } from "react-router-dom";

const STATUS_COLORS = {
    "Normal": "bg-green-500 text-white",
    "Hadir": "bg-green-500 text-white",
    "Tidak Normal": "bg-red-500 text-white",
    "Dinas Luar": "bg-gray-600 text-white",
    "Izin/Sakit": "bg-yellow-500 text-black",
};

const getStatusLabel = (history) => {
    if (history["keterangan"] === "Dinas Luar") {
        return "Dinas Luar";
    }
    if (history["keterangan"] === "Masuk Normal" && history["keterangan"] === "Pulang Normal") {
        return "Normal";
    }
    if (history["keterangan"] === "Terlambat Masuk" || history["keterangan"] === "Pulang Cepat" || 
        history["keterangan"] === "---" || history["keterangan"] === "---") {
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
        <Card asChild>
        <div className="p-0 shadow-md rounded-xl w-full max-w-md mx-auto">
            {/* Card Utama */}
            <div className="flex items-center gap-4 border-b pb-3">
                <img 
                    src={historyData.img_location} 
                    alt="Foto Profil" 
                    className="w-16 h-16 rounded-full border-2 border-gray-300"
                />
                <p className="font-semibold text-lg truncate">{historyData.nama_lengkap}</p>
            </div>
            
            {/* Card Anak */}
            {historyData?.result?.map((history, i) => { console.log(history);
                const statusLabel = getStatusLabel(history);
                return (
                    <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>            
            <Card asChild>
            <div className="mt-3 shadow-sm rounded-lg bg-gray-100 p-0">
                <div className="flex items-center gap-3">
                    <img 
                        src={history.foto_presensi} 
                        alt="Foto Presensi" 
                        className="w-12 h-12 rounded-lg border border-gray-300"
                    />
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">{formatDate(history.tanggal_presensi)}</p>
                        <p className="text-sm font-normal text-gray-600">{history.waktu_presensi}</p>
                    </div>
                </div>
                <Badge 
                    color={STATUS_COLORS[statusLabel]} 
                    className="w-full text-center mt-3 px-4 py-2 rounded-lg font-medium text-sm"
                >
                    {statusLabel}
                </Badge>
            </div>
            </Card>
            </motion.div>
                );
            })}
        </div>
        </Card>
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