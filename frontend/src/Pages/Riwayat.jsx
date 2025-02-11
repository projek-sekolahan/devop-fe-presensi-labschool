import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import CardRiwayat from "../Components/CardRiwayat";
import Layout from "../Components/Layout";
import { parseJwt, getFormData, handleSessionError, addDefaultKeys } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { Tabs } from "flowbite-react";

export default function Riwayat() {
    const [historyData, setHistoryData] = useState({});
    const [cardLoading, setCardLoading] = useState(true);
    const [localLoading, setLocalLoading] = useState(true);
    const [isFetched, setIsFetched] = useState({});
    const categories = ["Semua", "7 Hari", "14 Hari"];
    const [activeCategory, setActiveCategory] = useState("Semua");
    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;
    const authKey = localStorage.getItem("AUTH_KEY");
    const loginToken = localStorage.getItem("login_token");

    useEffect(() => {
        if (!userToken) window.location.replace("/login");
    }, [userToken]);

    const fetchHistory = useCallback(async (category) => {
        console.log("Fetching history for category:", category);
        if (isFetched[category]) {
            console.log("Data already exists for", category);
    // Pastikan selalu set ke loading saat mulai fetching
    setCardLoading(false);
    setLocalLoading(false);
            return;
        }
    
    // Pastikan selalu set ke loading saat mulai fetching
    setCardLoading(true);
    setLocalLoading(true);
        setIsFetched(prev => ({ ...prev, [category]: true })); // Tandai sudah di-fetch
        console.log("Fetching new data for", category);
    
        const keys = addDefaultKeys(["AUTH_KEY", "token", "table", "key"]);
        const values = keys.map((key) => {
            switch (key) {
                case "csrf_token": return Cookies.get("csrf");
                case "token": return loginToken;
                case "table": return "tab-presensi";
                case "key": return category === "Semua" ? "30 DAY" : category === "7 Hari" ? "7 DAY" : "14 DAY";
                default: return localStorage.getItem(key);
            }
        });
    
        try {
            const res = await apiXML.presensiPost("reports", authKey, getFormData(keys, values));
            console.log("Raw response:", res);
            const parsedRes = JSON.parse(res);
            Cookies.set("csrf", parsedRes.csrfHash);
    
            setHistoryData(prevData => ({
                ...prevData,
                [category]: parseJwt(parsedRes.data.token).data
            }));
    
            console.log("Fetched data for", category, "=>", parseJwt(parsedRes.data.token).data);
        } catch (err) {
    console.error("Error fetching history for", category, ":", err);
    const parsedErr = JSON.parse(err.responseText);
    Cookies.set("csrf", parsedErr.csrfHash);

    setHistoryData(prevData => ({
        ...prevData,
        [category]: prevData[category] ?? [] // Gunakan array kosong jika data sebelumnya belum ada
    }));

    if (parsedErr.status === 500) {
        setHistoryData(prevData => ({ ...prevData, [category]: [] }));
    } else {
        handleSessionError(parsedErr, "/login");
    }
        } finally {
            console.log("Setting cardLoading to false for", category);
    // Pastikan selalu set ke loading saat mulai fetching
    setCardLoading(false);
    setLocalLoading(false);
        }
    }, [isFetched, authKey, loginToken]);    

    useEffect(() => {
        setLocalLoading(true);
        fetchHistory(activeCategory).finally(() => {
            setTimeout(() => {
                setLocalLoading(false); // Pastikan ada delay agar loading terlihat
            }, 500); 
        });
    }, [activeCategory, fetchHistory]);

console.log("Render - activeCategory:", activeCategory);
console.log("Render - cardLoading:", cardLoading);
console.log("Render - localLoading:", localLoading);
console.log("Render - historyData[activeCategory]:", historyData[activeCategory]);

    return (
        <div className="history-container h-screen flex flex-col overflow-y-auto">
            <Layout link="/home" label="Riwayat">
                    <div className="custom-card mt-10">
                            <Tabs
                                aria-label="Tabs Riwayat"
                                onActiveTabChange={(tabIndex) => setActiveCategory(categories[tabIndex])}
                            >
                                {categories.map(category => (
                                    <Tabs.Item key={category} title={category}>
{(cardLoading || localLoading) ? (
    <LoadingPlaceholder />
) : (
    <>
        <p>Data untuk kategori {activeCategory}: {historyData[activeCategory]?.length}</p>
        {(historyData[activeCategory] && historyData[activeCategory].length > 0) ? (
            <HistoryList historyData={historyData[activeCategory]} biodata={userData} />
        ) : (
            <NoDataMessage />
        )}
    </>
)}
                                    </Tabs.Item>
                                ))}
                            </Tabs>
                    </div>
            </Layout>
        </div>
    );
}

const LoadingPlaceholder = () => (
    <div className="animate-pulse bg-white h-32 w-full rounded-md"></div>
);

const HistoryList = ({ historyData, biodata }) => (
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
            {historyData.map((history, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <CardRiwayat index={i} history={history} biodata={biodata} />
                </motion.div>
            ))}
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