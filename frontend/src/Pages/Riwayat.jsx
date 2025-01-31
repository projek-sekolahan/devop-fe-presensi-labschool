import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
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
    const [hasMore, setHasMore] = useState(true);

    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;

    useEffect(() => {
        if (!userToken) window.location.replace("/login");
    }, [userToken]);

    const fetchHistory = useCallback(async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
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

        try {
            const res = await apiXML.presensiPost(
                "reports",
                localStorage.getItem("AUTH_KEY"),
                getFormData(combinedKeys, values)
            );
            const parsedRes = JSON.parse(res);
            Cookies.set("csrf", parsedRes.csrfHash);
            const newData = parseJwt(parsedRes.data.token).data;
            console.log(parseJwt(parsedRes.data.token));
            if (newData.length === 0) {
                setHasMore(false);
            } else {
                setHistoryData((prevData) => [...prevData, ...newData]);
                setPage((prevPage) => prevPage + 1);
            }
        } catch (err) {
            const parsedErr = JSON.parse(err);
            if (parsedErr.status === 500) {
                setHasMore(false);
            } else {
                handleSessionError(parsedErr, "/login");
            }
        } finally {
            setIsLoading(false);
        }
    }, [filter, hasMore, isLoading]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setIsDropdownOpen(false);
        setHistoryData([]);
        setPage(1);
        setHasMore(true);
    };

    // Infinite Scroll Trigger
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.5,
    });

    useEffect(() => {
        if (inView && hasMore) {
            fetchHistory();
        }
    }, [inView, hasMore]);

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
                {historyData.map((history, i) => (
                    <CardRiwayat key={i} index={i} history={history} biodata={userData} />
                ))}
                {isLoading && (
                    <div className="size-full flex justify-center items-center">
                        <span className="loading-spinner"></span>
                    </div>
                )}
                {!isLoading && hasMore && <div ref={loadMoreRef}></div>}
                {!hasMore && (
                    <div className="size-full flex justify-center items-center">
                        <p className="text-white text-2xl">Tidak ada data lagi.</p>
                    </div>
                )}
            </main>
        </div>
    );
}