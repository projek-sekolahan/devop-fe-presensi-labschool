import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import apiXML from "../utils/apiXML";
import {
    getFormData,
    alertMessage,
    loading,
    handleSessionError,
} from "../utils/utils";
import Cookies from "js-cookie";
import axios from "axios";

export default function ChangePassword() {
    const emailRef = useRef();
    const [load, setLoad] = useState(false);

    const submitHandler = (e) => {
        e.preventDefault();
        loading("Loading", "Verifying Email...");
        setLoad(true);
        const key = ["username", "csrf_token"];
        const values = [emailRef.current.value, Cookies.get("csrf")];
        localStorage.setItem("email", emailRef.current.value);

        apiXML
            .postInput("recover", getFormData(key, values))
            .then((res) => {
                res = JSON.parse(res);
                // Cookies.set("csrf", res.csrfHash);
                setLoad(false);
                alertMessage(
                    res.data.info,
                    res.data.title,
                    res.data.message,
                    () => window.location.replace("/" + res.data.location)
                );
            })
            .catch((err) => {
                handleSessionError(err, "/recover");
            });
    };

    return (
        <div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
            <Link to="/">
                <ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
            </Link>
            <img
                src="/frontend/img/reset_pwd.png"
                alt="reset"
                className="w-screen h-2/3 absolute top-0 left-0 z-0"
            />
            <div className="w-full h-1/2 mt-auto bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8 relative z-10">
                <h2 className="font-bold text-4xl">Ganti Password</h2>
                <div className="my-6 space-y-4 md:space-y-6 p-4 pb-4">
                    <form className="space-y-4 md:space-y-6 flex flex-col gap-2">
                        <input
                            type="email"
                            name="email"
                            id="email"
                            ref={emailRef}
                            className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
                            placeholder="Email"
                            required=""
                        />
                        <button
                            onClick={submitHandler}
                            disabled={load}
                            className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                            {load ? (
                                <div className="flex justify-center items-center gap-2">
                                    <p>Loading</p>
                                    <span className="loading loading-spinner text-white"></span>
                                </div>
                            ) : (
                                "Ganti Password"
                            )}
                        </button>
                        <div
                            id="line"
                            className="w-full border-t-[0.25px] border-white h-0 relative top-4"
                        >
                            <p className="absolute text-center left-[calc(50%-1.25rem)] top-[-0.85rem] z-10 text-white bg-primary-md w-10">
                                or
                            </p>
                        </div>
                    </form>
                </div>
                <p className="text-center text-sm font-light text-white dark:text-gray-400 mt-5">
                    Belum memiliki akun?{" "}
                    <Link
                        to="/"
                        className="font-medium underline text-white hover:underline dark:text-primary-500"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
