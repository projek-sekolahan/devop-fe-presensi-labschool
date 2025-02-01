import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import CardRiwayat from "../Components/CardRiwayat";
import { parseJwt, getFormData, handleSessionError, addDefaultKeys } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { Dropdown } from "flowbite-react";

export default function Riwayat() {
    const [filter, setFilter] = useState("7 Hari");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [historyData, setHistoryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;

    useEffect(() => {
        if (!userToken) window.location.replace("/login");
    }, [userToken]);

    const handleClickOutside = useCallback((e) => {
        const dropdown = document.getElementById("dropdown");
        const dropdownContent = document.getElementById("dropdown-content");
        if (dropdown && dropdownContent && !dropdown.contains(e.target)) {
            setIsDropdownOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isDropdownOpen) {
            window.addEventListener("click", handleClickOutside);
        } else {
            window.removeEventListener("click", handleClickOutside);
        }
        return () => window.removeEventListener("click", handleClickOutside);
    }, [isDropdownOpen, handleClickOutside]);

    const fetchHistory = useCallback(() => {
        const keys = ["AUTH_KEY", "token", "table", "key"];
        const combinedKeys = addDefaultKeys(keys);

        const values = combinedKeys.map((key) => {
            let value = localStorage.getItem(key);
            if (key === "csrf_token" && !value) value = Cookies.get("csrf");
            if (key === "token") value = localStorage.getItem("login_token");
            if (key === "table" && !value) value = "tab-presensi";
            if (key === "key" && !value) {
                value = filter === "7 Hari" ? "7 DAY" : filter === "14 Hari" ? "14 DAY" : "30 DAY";
            }
            return value;
        });
        console.log(values); return false;
        if (!historyData && isLoading) {
            apiXML.presensiPost("reports", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values))
                .then((res) => {
                    const parsedRes = JSON.parse(res);
                    Cookies.set("csrf", parsedRes.csrfHash);console.log(parseJwt(parsedRes.data.token));
                    setHistoryData(parseJwt(parsedRes.data.token).data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    const parsedErr = JSON.parse(err);
                    if (parsedErr.status === 500) {
                        setIsLoading(false);
                        setHistoryData([]);
                    } else {
                        handleSessionError(parsedErr, "/login");
                    }
                });
        }
    }, [historyData, isLoading, filter]);

    useEffect(fetchHistory, [fetchHistory]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setIsDropdownOpen(false);
        setHistoryData(null);
        setIsLoading(true);
    };

    return (
        <div className="notification-container h-screen flex flex-col overflow-y-auto">
            <header>
                <Link to="/home">
                    <ArrowLeftIcon className="w-6 h-6 text-white" />
                </Link>
                <h1 className="notification-section-container">Riwayat</h1>
            </header>
            <main className="w-full min-h-screen relative px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
                <div className="w-fit mt-[-1.5rem] relative">
                    <Dropdown label={filter} className="btn bg-white border-none text-bg-3 btn-sm flex justify-between items-center">
                        {["7 Hari", "14 Hari", "30 Hari"].map((item) => (
                            <Dropdown.Item key={item} onClick={() => handleFilterChange(item)}>
                                {item}
                            </Dropdown.Item>
                        ))}
                    </Dropdown>
                </div>
                {isLoading ? (
                    <div className="mt-8 flex justify-center items-center">
                        <span className="loading-spinner"></span>
                    </div>
                ) : historyData?.length ? (
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
            </main>
        </div>
    );
}