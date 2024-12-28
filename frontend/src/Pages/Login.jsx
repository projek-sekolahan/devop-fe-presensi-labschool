import { Link } from "react-router-dom";
import { useRef, useEffect } from "react";
import PasswordShow from "../Components/PasswordShow";
import Cookies from "js-cookie";
import apiXML from "../utils/apiXML.js";
import {
    getHash,
    getKey,
    getFormData,
    alertMessage,
    loading,
    handleSessionError,
    addDefaultKeys,
} from "../utils/utils.js";

export default function Login() {
    // Refs for input elements
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const submitBtnRef = useRef(null);

    /**
     * Validate form inputs before submitting.
     * @returns {string|null} - Error message if validation fails, otherwise null.
     */
    const validateForm = () => {
        const emailValue = emailRef.current.value.trim();
        const passwordValue = passwordRef.current.value;

        if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
            return "Email tidak valid.";
        }
        if (passwordValue.length < 8) {
            return "Password harus minimal 8 karakter.";
        }
        return null;
    };

    /**
     * Handle form submission.
     * @param {Event} e - Form submit event.
     */
    const handleLogin = async (e) => {
        e.preventDefault();

        // Validate form
        const errorMessage = validateForm();
        if (errorMessage) {
            alertMessage("Validasi Gagal", errorMessage, "error");
            return;
        }

        // Prepare data for login
        const emailValue = emailRef.current.value.trim();
        const passwordValue = passwordRef.current.value;
        const hash = getHash(passwordValue);
        const tokenKey = getKey(emailValue, hash);

        const keys = ["username", "password"];
        const values = [emailValue, hash, tokenKey[1], Cookies.get("csrf")];
        const formData = getFormData(addDefaultKeys(keys), values);

        // Save temporary keys in secure storage
        localStorage.setItem("AUTH_KEY", tokenKey[0]);
        localStorage.setItem("devop-sso", tokenKey[1]);
        
        try {
            // Show loading indicator
            loading("Loading", "Logging in...");

            // Perform login request
            const response = await apiXML.authPost(
                "login",
                localStorage.getItem("AUTH_KEY"),
                formData
            );
            const loginResponse = JSON.parse(response);
console.log(loginResponse); return false;
            // Save token securely
            localStorage.setItem("login_token", loginResponse.data.token);
            Cookies.set("csrf", loginResponse.csrfHash, { secure: true, sameSite: "Strict" });

            // Show success message and redirect
            alertMessage(
                "Berhasil",
                loginResponse.data.message,
                "success",
                () => window.location.replace("/home")
            );
        } catch (error) {
            // Handle errors (e.g., server or network errors)
            handleSessionError(error, "/login");
        }
    };

    /**
     * Add global event listener for the Enter key.
     */
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === "Enter") {
                submitBtnRef.current.click();
            }
        };
        window.addEventListener("keypress", handleKeyPress);

        return () => {
            window.removeEventListener("keypress", handleKeyPress);
        };
    }, []);

    return (
        <div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
            <img
                src="/frontend/img/login.png"
                alt="labschool-unesa-logo"
                className="w-full h-[60vh] absolute top-0 left-0 z-0"
            />
            <div className="w-full h-fit bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8 absolute z-10">
                <h2 className="font-bold text-4xl">Login Dulu</h2>
                <p className="font-light text-xs">{"Selamat datang kembali!!!"}</p>
                <form className="my-6 space-y-4 md:space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 md:space-y-6 flex flex-col gap-2">
                        <input
                            type="email"
                            name="email"
                            id="email"
                            ref={emailRef}
                            className="bg-primary-md border-white border-[1px] placeholder-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black w-full py-3 px-4"
                            placeholder="Email"
                            required
                        />
                        <div className="flex gap-2">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                ref={passwordRef}
                                placeholder="Password (8 or more characters)"
                                className="flex-1 bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
                                required
                            />
                            <PasswordShow ref={passwordRef} />
                        </div>
                        <Link
                            to="/recover"
                            className="text-sm font-light text-end"
                        >
                            Lupa password?
                        </Link>
                        <button
                            type="submit"
                            ref={submitBtnRef}
                            className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                            Login
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
                <p className="text-center text-sm font-light text-white dark:text-gray-400 mt-10">
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