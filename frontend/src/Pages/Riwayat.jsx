import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CardRiwayat from "../Components/CardRiwayat";
import { parseJwt, getFormData, handleSessionError, addDefaultKeys } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { Tabs } from "flowbite-react";

export default function Riwayat() {
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState(["7 Hari", "14 Hari", "30 Hari"]);
    const [activeCategory, setActiveCategory] = useState("7 Hari");
    
    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;

    useEffect(() => {
        if (!userToken) window.location.replace("/login");
    }, [userToken]);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        const keys = ["AUTH_KEY", "token", "table", "key"];
        const combinedKeys = addDefaultKeys(keys);
        const values = [
            localStorage.getItem("AUTH_KEY"),
            localStorage.getItem("login_token"),
            "tab-presensi",
            activeCategory === "7 Hari" ? "7 DAY" : activeCategory === "14 Hari" ? "14 DAY" : "30 DAY"
        ];

        try {
            const res = await apiXML.presensiPost("reports", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values));
            const parsedRes = JSON.parse(res);
            Cookies.set("csrf", parsedRes.csrfHash);
            setHistoryData(parseJwt(parsedRes.data.token).result);
        } catch (err) {
            const parsedErr = JSON.parse(err.responseText);
            Cookies.set("csrf", parsedErr.csrfHash);
            if (parsedErr.status === 500) {
                setHistoryData([]);
            } else {
                handleSessionError(parsedErr, "/login");
            }
        } finally {
            setIsLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="notification-container h-screen flex flex-col overflow-y-auto">
            <header>
                <Link to="/home">
                    <ArrowLeftIcon className="w-6 h-6 text-white" />
                </Link>
                <h1 className="notification-section-container">Riwayat</h1>
            </header>
            <main className="w-full min-h-screen relative px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
                <Tabs
                    aria-label="Tabs Riwayat"
                    onActiveTabChange={(tabIndex) => setActiveCategory(categories[tabIndex])}
                >
                    {categories.map((category) => (
                        <Tabs.Item key={category} title={category}>
                            {isLoading ? (
                                <div className="flex justify-center items-center">
                                    <span className="loading-spinner"></span>
                                </div>
                            ) : historyData.length ? (
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
                                <div className="size-full flex justify-center items-center">
                                    <p className="text-white text-xl">Belum ada riwayat.</p>
                                </div>
                            )}
                        </Tabs.Item>
                    ))}
                </Tabs>
            </main>
        </div>
    );
}