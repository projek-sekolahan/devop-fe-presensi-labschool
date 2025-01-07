import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import Cookies from "js-cookie";
import apiXML from "../utils/apiXML.js";
import {
    getFormData,
    alertMessage,
    loading,
    handleSessionError,
} from "../utils/utils";
import RoleSelection from "../Components/RoleSelection";
import InputField from "../Components/InputField";

export default function Register() {
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const nameRef = useRef();
    const numberRef = useRef();
    const emailRef = useRef();
    const navigate = useNavigate();

    const validateInput = () => {
        const email = emailRef.current.value;
        const phone = numberRef.current.value;
        const name = nameRef.current.value;

        if (!name || !phone || !email) {
            alertMessage("Input Error", "Semua field harus diisi.", "error",);
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,13}$/;

        if (!emailRegex.test(email)) {
            alertMessage("Email Invalid", "Harap masukkan email yang valid.", "error",);
            return false;
        }

        if (!phoneRegex.test(phone)) {
            alertMessage(
                "Nomor Telepon Invalid",
                "Harap masukkan nomor telepon yang valid (10-13 digit).",
                "error",
            );
            return false;
        }

        if (!role) {
            alertMessage("Role Error", "Harap pilih salah satu role.", "error",);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateInput()) return;

        setIsLoading(true);
        loading("Loading", "Registering...");

        const keys = ["username", "phone", "namaLengkap", "sebagai", "csrf_token"];
        const values = [
            emailRef.current.value,
            numberRef.current.value,
            nameRef.current.value,
            role,
            Cookies.get("csrf"),
        ];

        try {
            const response = await apiXML.postInput("register", getFormData(keys, values));
            const res = JSON.parse(response);
            Cookies.set("csrf", res.csrfHash);
            alertMessage(
                res.data.title,
                res.data.message,
                res.data.info,
                () =>
                    navigate(
                        res.data.location === "register" ? "/register" : `/${res.data.location}`
                    )
            );
        } catch (err) {
            handleSessionError(err, "/register");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative">
            <h1 className="text-center mt-16 text-4xl font-bold text-white">Register</h1>
            <small className="text-center text-xs font-medium text-white mt-1">
                Selamat datang!
            </small>
            <div className="w-full h-fit bg-primary-md rounded-t-[2rem] absolute bottom-0 left-0 p-4 pb-8">
                <form onSubmit={handleSubmit} className="w-full p-6 flex flex-col gap-2">
                    <RoleSelection role={role} setRole={setRole} />
                    <div className="space-y-4 md:space-y-6 flex flex-col gap-2">
                        <InputField
                            id="name"
                            name="namaLengkap"
                            placeholder="Nama Lengkap"
                            ref={nameRef}
                        />
                        <InputField
                            id="number"
                            name="phone"
                            placeholder="No. Telepon"
                            ref={numberRef}
                        />
                        <InputField
                            id="username"
                            type="email"
                            name="username"
                            placeholder="Email"
                            ref={emailRef}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center ${
                                isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex justify-center items-center gap-2">
                                    <p className="text-white">Loading</p>
                                    <span className="loading loading-spinner text-white"></span>
                                </div>
                            ) : (
                                "Create my account"
                            )}
                        </button>
                    </div>
                    <div
                        id="line"
                        className="w-full border-t-[0.25px] border-white h-0 relative top-4"
                    >
                        <p className="absolute text-center left-[calc(50%-1.25rem)] top-[-0.85rem] z-10 text-white bg-primary-md w-10">
                            or
                        </p>
                    </div>
                </form>
                <p className="text-center text-sm font-light text-white mt-5">
                    Sudah memiliki akun?{" "}
                    <Link
                        to="/login"
                        className="font-medium underline text-white hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}