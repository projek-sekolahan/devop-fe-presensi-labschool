import { Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import CardRiwayat from "../Components/CardRiwayat";
import {
    parseJwt,
    getFormData,
    handleSessionError,
    addDefaultKeys,
} from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";

export default function Riwayat() {
    const [filter, setFilter] = useState("7 Hari");
    const [swapButton, setSwapButton] = useState(["on", "off"]);
    const [historys, setHistorys] = useState(null);
    const [load, setLoad] = useState(true);

    const userToken = localStorage.getItem("token");
    const userData = userToken ? parseJwt(userToken) : null;

    useEffect(() => {
        if (!userToken) {
            window.location.replace("/login");
        }
    }, [userToken]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const dropdown = document.getElementById("dropdown");
            const dropdownContent = document.getElementById("dropdown-content");

            if (
                dropdown &&
                dropdownContent &&
                !dropdown.contains(e.target) &&
                swapButton[0] === "off"
            ) {
                dropdownContent.classList.add("hidden");
                setSwapButton(["on", "off"]);
            }
        };

        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, [swapButton]);

    const fetchHistory = () => {
        const keys = ["AUTH_KEY", "token", "table", "key"];
        const combinedKeys = addDefaultKeys(keys);

        const values = combinedKeys.map((key) => {
            let value = localStorage.getItem(key);
            if (key === "csrf_token" && !value) {
                value = Cookies.get("csrf");
            }
            if (key === "token") value = localStorage.getItem("login_token");
            if (key === "table" && !value) {
                value = "tab-presensi";
            }
            if (key === "key" && !value) {
                value = filter === "7 Hari" ? "7 DAY" : "14 DAY";
            }
            return value;
        });

        if (!historys && load) {
            apiXML
                .presensiPost(
                    "reports",
                    localStorage.getItem("AUTH_KEY"),
                    getFormData(combinedKeys, values)
                )
                .then((res) => {
                    const parsedRes = JSON.parse(res);
                    Cookies.set("csrf", parsedRes.csrfHash);
                    const parsedToken = parseJwt(parsedRes.data.token);
                    setHistorys(parsedToken.data);
                    setLoad(false);
                })
                .catch((err) => {
                    const parsedErr = JSON.parse(err);
                    if (parsedErr.status === 500) {
                        setLoad(false);
                        setHistorys([]);
                    } else {
                        handleSessionError(parsedErr, "/login");
                    }
                });
        }
    };

    useEffect(fetchHistory, [historys, load, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setSwapButton(["on", "off"]);
        setHistorys(null);
        setLoad(true);
    };

    return (
    <div className="notification-container">
      <header>
        <Link to="/home">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </Link>
        <h1 className="notification-section-container">Riwayat</h1>
      </header>
            <main className="w-full h-full relative bottom-0 left-0 px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
                <div id="dropdown" className="w-fit mt-[-1.5rem]">
                    <button
                        className="btn m-1 ml-0 bg-white border-none text-bg-3 btn-sm flex justify-between items-center"
                        onClick={() =>
                            setSwapButton((prev) =>
                                prev[0] === "on" ? ["off", "on"] : ["on", "off"]
                            )
                        }
                    >
                        <p>{filter}</p>
                        <ChevronDownIcon
                            className={`${
                                swapButton[0] === "on" ? "" : "hidden"
                            } size-5`}
                        />
                        <ChevronUpIcon
                            className={`${
                                swapButton[1] === "on" ? "" : "hidden"
                            } size-5`}
                        />
                    </button>
                    <ul
                        id="dropdown-content"
                        className={`${
                            swapButton[0] === "off" ? "" : "hidden"
                        } absolute z-[1] menu p-2 shadow bg-white rounded-box w-52`}
                    >
                        <li>
                            <button onClick={() => handleFilterChange("7 Hari")}>
                                7 Hari
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleFilterChange("14 Hari")}>
                                14 Hari
                            </button>
                        </li>
                    </ul>
                </div>
                {load ? (
                    <div className="size-full flex justify-center items-center">
                        <span className="loading loading-spinner text-white"></span>
                    </div>
                ) : historys && historys.length > 0 ? (
                    historys.map((history, i) => (
                        <CardRiwayat
                            key={i}
                            index={i}
                            history={history}
                            biodata={userData}
                        />
                    ))
                ) : (
                    <div className="size-full flex justify-center items-center">
                        <p className="text-white">Belum ada riwayat.</p>
                    </div>
                )}
            </main>
    </div>
    );
}