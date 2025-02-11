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
    const categories = ["Semua", "7 Hari", "14 Hari"];
    const [historyData, setHistoryData] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState("Semua");
    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;
    const loginToken = localStorage.getItem("login_token");
    const authKey = localStorage.getItem("AUTH_KEY");

    useEffect(() => {
        if (!userToken) {
            window.location.replace("/login");
        }
    }, [userToken]);

    useEffect(() => {
        fetchHistory(activeCategory);
    }, [activeCategory]);

    const fetchHistory = useCallback(async (category) => {
        setLoading(true);
        const keys = addDefaultKeys(["AUTH_KEY", "token", "table", "key"]);
        const values = getValuesForKeys(keys, category);

        try {
            const res = await apiXML.presensiPost("reports", authKey, getFormData(keys, values));
            const parsedRes = JSON.parse(res);
            Cookies.set("csrf", parsedRes.csrfHash);
            const parsedData = parseJwt(parsedRes.data.token).data || [];

            setHistoryData(prevData => ({
                ...prevData,
                [category]: parsedData
            }));
        } catch (err) {
            handleError(err, category);
        } finally {
            setLoading(false);
        }
    }, [authKey, loginToken]);

    const getValuesForKeys = (keys, category) => {
        return keys.map((key) => {
            switch (key) {
                case "csrf_token": return Cookies.get("csrf");
                case "token": return loginToken;
                case "table": return "tab-presensi";
                case "key": return getCategoryKey(category);
                default: return localStorage.getItem(key);
            }
        });
    };

    const getCategoryKey = (category) => {
        switch (category) {
            case "Semua": return "30 DAY";
            case "7 Hari": return "7 DAY";
            case "14 Hari": return "14 DAY";
            default: return "30 DAY";
        }
    };

    const handleError = (err, category) => {
        console.error(`Error fetching history for ${category}:`, err);
        const parsedErr = err.responseText ? JSON.parse(err.responseText) : err;
        Cookies.set("csrf", parsedErr.csrfHash);

        setHistoryData(prevData => ({
            ...prevData,
            [category]: []
        }));

        if (parsedErr.status === 500) {
            setHistoryData(prevData => ({ ...prevData, [category]: [] }));
        } else {
            handleSessionError(parsedErr, "/login");
        }
    };

    return (
        <div className="history-container h-screen flex flex-col overflow-y-auto">
            <Layout link="/home" label="Riwayat">
                <div className="custom-card mt-10">
                    <Tabs aria-label="Tabs Riwayat" onActiveTabChange={(tabIndex) => setActiveCategory(categories[tabIndex])}>
                        {categories.map(category => (
                            <Tabs.Item key={category} title={category}>
                                {loading ? <LoadingPlaceholder /> : (
                                    historyData[activeCategory]?.length > 0 ? (
                                        <HistoryList historyData={historyData[activeCategory]} biodata={userData} />
                                    ) : (
                                        <NoDataMessage />
                                    )
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