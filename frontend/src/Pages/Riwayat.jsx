import { Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
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

    let userData = {};

    if (localStorage.getItem("token")) {
        userData = parseJwt(localStorage.getItem("token"));
    } else {
        window.location.replace("/login");
    }

    userData = parseJwt(localStorage.getItem("token"));

    window.addEventListener("click", (e) => {
        const dropdown = document.getElementById("dropdown");
        const dropdownContent = document.getElementById("dropdown-content");
        if (!dropdown.contains(e.target) && swapButton[0] == "off") {
            dropdownContent.classList.add("hidden");
            setSwapButton(["on", "off"]);
        }
    });

    const keys = ["AUTH_KEY", "token", "table", "key"];
    const combinedKeys = addDefaultKeys(keys);
    // Fetch values from localStorage and Cookies
    let values = combinedKeys.map((key) => {
        let value = localStorage.getItem(key);
        if (key === "csrf_token" && !value) {
            value = Cookies.get("csrf");
        }
        if (key === "table" && !value) {
            value = "tab-presensi";
        }
        if (key === "key" && !value) {
            if (filter === "7 Hari") {
                value = "7 DAY";
            } else {
                value = "14 DAY";
            }
        }
        return value;
    });
    !historys &&
        load &&
        apiXML
            .presensiPost(
                "reports",
                localStorage.getItem("AUTH_KEY"),
                getFormData(combinedKeys, values)
            )
            .then((res) => {
                res = JSON.parse(res);
                Cookies.set("csrf", res.csrfHash);
                const parsedToken = parseJwt(res.data.token);
                setHistorys(parsedToken.data);
                setLoad(false);
            })
            .catch((err) => {
                console.log(err);
                err = JSON.parse(err);
                if (err.status == 500) {
                    setLoad(false);
                    setHistorys("no data found");
                    console.log("no data found");
                } else {
                    handleSessionError(err, "/login");
                }
            });

    return (
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white">
            <header className="h-1/5 min-h-[130px] bg-primary-md relative p-6">
                <Link to="/home" className="absolute top-5">
                    <ArrowLeftIcon className="size-7" />
                </Link>

                <h2 className="text-[2.125rem] font-bold absolute bottom-5">
                    Riwayat Presensi
                </h2>
            </header>
            <main className="w-full h-full relative bottom-0 left-0 px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
                <div id="dropdown" className="w-fit mt-[-1.5rem]">
                    <button
                        className="btn m-1 ml-0 bg-white border-none text-bg-3 btn-sm flex justify-between items-center"
                        onClick={() => {
                            swapButton[0] == "on"
                                ? setSwapButton(["off", "on"])
                                : setSwapButton(["on", "off"]);
                        }}
                    >
                        <p>{filter}</p>
                        <ChevronDownIcon
                            className={`${
                                swapButton[0] == "on" ? "" : "hidden"
                            } size-5`}
                        />
                        <ChevronUpIcon
                            className={`${
                                swapButton[1] == "on" ? "" : "hidden"
                            } size-5`}
                        />
                    </button>
                    <ul
                        tabIndex={0}
                        id="dropdown-content"
                        className={`${
                            swapButton[0] == "off" ? "" : "hidden"
                        } absolute z-[1] menu p-2 shadow bg-white rounded-box w-52`}
                    >
                        <li>
                            <button
                                onClick={() => {
                                    setFilter("7 Hari");
                                    setSwapButton(["on", "off"]);
                                    setHistorys(null);
                                    setLoad(true);
                                }}
                            >
                                7 Hari
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    setFilter("14 Hari");
                                    setSwapButton(["on", "off"]);
                                    setHistorys(null);
                                    setLoad(true);
                                }}
                            >
                                14 Hari
                            </button>
                        </li>
                    </ul>
                </div>
                {load ? (
                    <div className="size-full flex justify-center items-center">
                        <span className="loading loading-spinner text-white"></span>
                    </div>
                ) : historys ? (
                    historys.map((history, i) => {
                        return (
                            <CardRiwayat
                                key={i}
                                index={i}
                                history={history}
                                biodata={userData}
                            />
                        );
                    })
                ) : (
                    <div className="size-full flex justify-center items-center">
                        <p className="text-white">Belum ada riwayat.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
