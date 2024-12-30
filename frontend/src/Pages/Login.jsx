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
// console.log(loginResponse); return false;
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
<div className="login-container flex flex-col h-screen w-full sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
    {/* Background Image */}
    <img
        src="/frontend/img/login.png"
        alt="labschool-unesa-logo"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
    />

    {/* Login Form */}
    <div className="login-form-container bg-white p-8 rounded-lg shadow-md relative z-10">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">Login Dulu</h2>
        <p className="text-center text-gray-600 mb-6">Selamat datang kembali!!!</p>

        <form
            className="space-y-4"
            onSubmit={handleLogin}
        >
            {/* Email Input */}
            <div className="input-group">
                <label htmlFor="email" className="input-label block text-sm font-medium text-gray-700 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    ref={emailRef}
                    className="input-field w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                    required
                />
            </div>

            {/* Password Input */}
            <div className="input-group">
                <label htmlFor="password" className="input-label block text-sm font-medium text-gray-700 mb-1">
                    Password
                </label>
                <div className="password-container flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                        type="password"
                        name="password"
                        id="password"
                        ref={passwordRef}
                        placeholder="Password (8 or more characters)"
                        className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none"
                        required
                    />
                    <PasswordShow ref={passwordRef} />
                </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
                <Link to="/recover" className="text-sm text-blue-500 hover:underline">
                    Lupa password?
                </Link>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                ref={submitBtnRef}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Login
            </button>

            {/* Separator Line */}
            <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-sm text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm font-light">
            Belum memiliki akun?{' '}
            <Link to="/register" className="text-blue-500 font-medium hover:underline">
                Register
            </Link>
        </p>
    </div>
</div>

    );
}