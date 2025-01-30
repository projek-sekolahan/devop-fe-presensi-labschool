import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import CardRiwayat from "../Components/CardRiwayat";
import { parseJwt, getFormData, handleSessionError, addDefaultKeys } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";

export default function Riwayat() {
    const [filter, setFilter] = useState("7 Hari");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const observer = useRef(null);

    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;

    useEffect(() => {
        if (!userToken) window.location.replace("/login");
    }, [userToken]);

    const fetchHistory = useCallback(() => {
        setIsLoading(true);
        const keys = ["AUTH_KEY", "token", "table", "key", "page"];
        const combinedKeys = addDefaultKeys(keys);
        const values = combinedKeys.map((key) => {
            let value = localStorage.getItem(key);
            if (key === "csrf_token" && !value) value = Cookies.get("csrf");
            if (key === "token") value = localStorage.getItem("login_token");
            if (key === "table" && !value) value = "tab-presensi";
            if (key === "key" && !value) {
                value = filter === "7 Hari" ? "7 DAY" : filter === "14 Hari" ? "14 DAY" : "30 DAY";
            }
            if (key === "page") value = page;
            return value;
        });

        apiXML.presensiPost("reports", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values))
            .then((res) => {
                const parsedRes = JSON.parse(res);
                Cookies.set("csrf", parsedRes.csrfHash); console.log(parseJwt(parsedRes.data.token).data);
                setHistoryData((prev) => [...prev, ...parseJwt(parsedRes.data.token).data]);
                setIsLoading(false);
            })
            .catch((err) => {
                const parsedErr = JSON.parse(err);
                setIsLoading(false);
                if (parsedErr.status !== 500) {
                    handleSessionError(parsedErr, "/login");
                }
            });
    }, [filter, page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading) {
                setPage((prev) => prev + 1);
            }
        });
        if (observer.current) {
            observer.current.observe(document.getElementById("load-more"));
        }
        return () => observer.current.disconnect();
    }, [isLoading]);

    return (
        <div className="notification-container">
            <header>
                <Link to="/home">
                    <ArrowLeftIcon className="w-6 h-6 text-white" />
                </Link>
                <h1 className="notification-section-container">Riwayat</h1>
            </header>
            <main className="w-full h-full relative px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
                <div className="w-fit mt-[-1.5rem] relative">
                    <button
                        className="btn bg-white border-none text-bg-3 btn-sm flex justify-between items-center"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <p>{filter}</p>
                        {isDropdownOpen ? <ChevronUpIcon className="size-5" /> : <ChevronDownIcon className="size-5" />}
                    </button>
                    {isDropdownOpen && (
                        <ul className="absolute z-10 menu p-2 shadow bg-white rounded-box w-52">
                            {["7 Hari", "14 Hari", "30 Hari"].map((item) => (
                                <li key={item}>
                                    <button onClick={() => setFilter(item)}>{item}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {historyData.length ? (
                    historyData.map((history, i) => (
                        <CardRiwayat key={i} index={i} history={history} biodata={userData} />
                    ))
                ) : (
                    <div className="size-full flex justify-center items-center">
                        <p className="text-white">Belum ada riwayat.</p>
                    </div>
                )}
                <div id="load-more" className="h-10"></div>
                {isLoading && (
                    <div className="size-full flex justify-center items-center">
                        <span className="loading loading-spinner text-white"></span>
                    </div>
                )}
            </main>
        </div>
    );
}
