import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import CardRiwayat from "../Components/CardRiwayat";
import { parseJwt, getFormData, handleSessionError, addDefaultKeys } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";

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

        if (!historyData && isLoading) {
            apiXML.presensiPost("reports", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values))
                .then((res) => {
                    const parsedRes = JSON.parse(res);
                    Cookies.set("csrf", parsedRes.csrfHash);
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
                <div id="dropdown" className="w-fit mt-[-1.5rem] relative">
                    <button
                        className="btn bg-white border-none text-bg-3 btn-sm flex justify-between items-center"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <p>{filter}</p>
                        {isDropdownOpen ? <ChevronUpIcon className="size-5" /> : <ChevronDownIcon className="size-5" />}
                    </button>
                    {isDropdownOpen && (
                        <ul id="dropdown-content" className="absolute z-10 menu p-2 shadow bg-white rounded-box w-52">
                            {["7 Hari", "14 Hari", "30 Hari"].map((item) => (
                                <li key={item}>
                                    <button onClick={() => handleFilterChange(item)}>{item}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {isLoading ? (
                    <div className="size-full flex justify-center items-center">
                        <span className="loading-spinner"></span>
                    </div>
                ) : historyData?.length ? (
                    historyData.map((history, i) => (
                        <CardRiwayat key={i} index={i} history={history} biodata={userData} />
                    ))
                ) : (
                    <div className="size-full flex justify-center items-center">
                        <p className="text-white text-xl">Belum ada riwayat.</p>
                    </div>
                )}
            </main>
        </div>
    );
}