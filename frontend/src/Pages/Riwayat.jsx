import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import CardRiwayat from "../Components/CardRiwayat";
import { parseJwt, getFormData, handleSessionError, addDefaultKeys } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { Tabs } from "flowbite-react";

export default function Riwayat() {
    const [historyData, setHistoryData] = useState({});
    const [cardLoading, setCardLoading] = useState(true);
    const [categories] = useState(["Semua", "7 Hari", "14 Hari"]);
    const [activeCategory, setActiveCategory] = useState("Semua");
    
    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;

    useEffect(() => {
        if (!userToken) window.location.replace("/login");
    }, [userToken]);

    const fetchHistory = useCallback(async (category) => {
        if (historyData[category]) {
            setCardLoading(false);
            return;
        }
        
        setCardLoading(true);
        const keys = ["AUTH_KEY", "token", "table", "key"];
        const combinedKeys = addDefaultKeys(keys);
        const values = combinedKeys.map((key) => {
            let value = localStorage.getItem(key);
            if (key === "csrf_token" && !value) value = Cookies.get("csrf");
            if (key === "token") value = localStorage.getItem("login_token");
            if (key === "table" && !value) value = "tab-presensi";
            if (key === "key" && !value) {
                value = category === "Semua" ? "30 DAY" : category === "7 Hari" ? "7 DAY" : "14 DAY";
            }
            return value;
        });

        try {
            const res = await apiXML.presensiPost("reports", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values));
            const parsedRes = JSON.parse(res);
            Cookies.set("csrf", parsedRes.csrfHash);
            setHistoryData((prevData) => ({ ...prevData, [category]: parseJwt(parsedRes.data.token).data }));
        } catch (err) {
            console.log(err);
            const parsedErr = JSON.parse(err.responseText);
            Cookies.set("csrf", parsedErr.csrfHash);
            if (parsedErr.status === 500) {
                setHistoryData((prevData) => ({ ...prevData, [category]: [] }));
            } else {
                handleSessionError(parsedErr, "/login");
            }
        } finally {
            setCardLoading(false);
        }
    }, [historyData]);

    useEffect(() => {
        fetchHistory(activeCategory);
    }, [activeCategory, fetchHistory]);

    return (
        <div className="history-container h-screen flex flex-col overflow-y-auto">
            <header>
                <Link to="/home">
                    <ArrowLeftIcon className="w-6 h-6 text-white" />
                </Link>
                <h1 className="history-section-container">Riwayat</h1>
            </header>
            <main className="w-full min-h-screen relative px-8 text-black flex flex-col gap-4 overflow-y-auto">
                <div className="custom-card">
                    <Tabs
                        aria-label="Tabs Riwayat"
                        onActiveTabChange={(tabIndex) => setActiveCategory(categories[tabIndex])}
                    >
                        {categories.map((category) => (
                            <Tabs.Item key={category} title={category}>
                                {cardLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-32 w-full rounded-md"></div>
                                ) : historyData[category]?.length ? (
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
                                            {historyData[category].map((history, i) => (
                                                <motion.div
                                                    key={i}
                                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                                >
                                                    <CardRiwayat index={i} history={history} biodata={userData} />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </AnimatePresence>
                                ) : (
                                    <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
                                        <div className="flex items-center gap-3">
                                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                                            <h4 className="text-lg font-semibold">Warning</h4>
                                        </div>
                                        <p className="mt-2 text-sm">Tidak ada data riwayat presensi yang tersedia. Harap coba lagi nanti.</p>
                                    </div>
                                )}
                            </Tabs.Item>
                        ))}
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
