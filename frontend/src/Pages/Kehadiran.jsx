import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Layout from "../Components/Layout";
import { getFormData, handleSessionError, addDefaultKeys } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { Card, Badge } from "flowbite-react";
import { useParams } from "react-router-dom";

const STATUS_COLORS = {
    "Normal": "bg-green-500 text-white",
    "Hadir": "bg-green-500 text-white",
    "Tidak Normal": "bg-red-500 text-white",
    "Dinas Luar": "bg-gray-600 text-white",
    "Izin/Sakit": "bg-yellow-500 text-black",
};

const getStatusLabel = (history) => {
    if (history["Keterangan"] === "Dinas Luar") {
        return "Dinas Luar";
    }
    if (history["Status Masuk"] === "Masuk Normal" && history["Status Pulang"] === "Pulang Normal") {
        return "Normal";
    }
    if (history["Status Masuk"] === "Terlambat Masuk" || history["Status Pulang"] === "Pulang Cepat" || 
        history["Status Masuk"] === "---" || history["Status Pulang"] === "---") {
        return "Tidak Normal";
    }
    return "Izin/Sakit";
};

export default function Riwayat() {
    const [historyData, setHistoryData] = useState([]);
    const [cardLoading, setCardLoading] = useState(true);
    const [localLoading, setLocalLoading] = useState(true);
    const { id } = useParams();

    // Redirect if no id
    useEffect(() => {
        if (!id) window.location.replace("*");
    }, [id]);

    // Fetch history data with error handling
    const fetchHistory = useCallback(async () => {
        setCardLoading(true);
        setLocalLoading(true);
        const keys = addDefaultKeys(["csrf_token", "token"]);
        const values = keys.map((key) => {
            switch (key) {
                case "csrf_token":
                    return Cookies.get("csrf");
                case "token":
                    return loginToken;
                default:
                    return null;
            }
        });
        try {
            const res = await apiXML.postInput("reports", getFormData(keys, values));
            Cookies.set("csrf", res.csrfHash);
            setHistoryData(res);
        } catch (err) {
            const errorResponse = err.response ? JSON.parse(err.responseText) : err;
            Cookies.set("csrf", errorResponse.csrfHash);
            handleSessionError(errorResponse, "*");
        } finally {
            setCardLoading(false);
            setLocalLoading(false);
        }
    }, []);
    // Initial fetch on mount
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="history-container h-screen flex flex-col overflow-y-auto">
            <Layout link="*" label="Riwayat">
                <div className="custom-card mt-10">
                    {(cardLoading || localLoading) ? (
                        <LoadingPlaceholder />
                    ) : (
                        <>
                            {historyData.length > 0 ? (
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
            {historyData.map((history, i) => {
                const statusLabel = getStatusLabel(history);
                return (
                    <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <Card className="card-history">
                            <div className="flex items-center gap-3 border-b pb-2">
                                <img
                                    src={history.img_location} // Assuming img_location is part of historyData
                                    alt="photo_profile"
                                    className="w-12 h-12 rounded-full bg-white border"
                                />
                                <p className="font-semibold text-lg">{history["Nama Lengkap"]}</p>
                            </div>
                            <p className="font-medium text-gray-600 mt-3">{formatDate(history["Tanggal Presensi"])}</p>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <p><span className="text-green-600 font-medium">Masuk: </span>{history["Jam Masuk"]}</p>
                                <p><span className="text-red-600 font-medium">Keluar: </span>{history["Jam Pulang"]}</p>
                            </div>
                            <Badge color={STATUS_COLORS[statusLabel]} className="w-full mt-3 px-4 py-2 rounded-md font-semibold text-sm">
                                {statusLabel}
                            </Badge>
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    </AnimatePresence>
);

const NoDataMessage = () => (
    <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
            <h4 className="text-lg font-semibold">Warning</h4>
        </div>
        <p className="mt-2 text-sm">Tidak ada data riwayat presensi yang tersedia. Harap coba lagi nanti.</p>
    </div>
);