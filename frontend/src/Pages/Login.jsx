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

            // Save token securely
            localStorage.setItem("login_token", loginResponse.data.token);
            // Cookies.set("csrf", loginResponse.csrfHash, { secure: true, sameSite: "Strict" });
            alert("menuju homepage");
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
                e.preventDefault(); // Cegah reload form
                alert("Press Enter start detected");
                submitBtnRef.current?.click(); // Pastikan referensi valid
            }
        };
        window.addEventListener("keydown", handleKeyPress); // Gunakan keydown
    
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);    

    return (
        <div className="login-container flex flex-col min-h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
            {/* Background Image */}
            <img
                src="/frontend/img/login.png"
                alt="labschool-unesa-logo"
                className="login-bg-image"
            />

            {/* Login Form */}
<div className="login-form-container shadow-md">
    <h2 className="text-title text-center">Yuk Login!</h2>
    <p className="text-subtitle text-center">Solusi Pintar Sekolah Digital</p>
    <form
        className="login-form"
        onSubmit={handleLogin}
    >
        {/* Email Input */}
        <div className="input-group">
            <label htmlFor="email" className="input-label">
                Email
            </label>
            <input
                type="email"
                name="email"
                id="email"
                ref={emailRef}
                className="input-field"
                placeholder="Email"
                autoComplete="username"
                required
            />
        </div>

        {/* Password Input */}
        <div className="input-group">
            <label htmlFor="password" className="input-label">
                Password
            </label>
            <div className="password-container">
                <input
                    type="password"
                    name="password"
                    id="password"
                    ref={passwordRef}
                    placeholder="Password (8 or more characters)"
                    className="input-field flex-1"
                    autoComplete="current-password"
                    required
                />
                <PasswordShow ref={passwordRef} />
            </div>
        </div>

        {/* Forgot Password and Register Link */}
        <div className="flex justify-between items-center text-sm">
            <Link to="/register" className="text-link">
                Belum memiliki akun?
            </Link>
            <Link to="/recover" className="text-link">
                Lupa password?
            </Link>
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            ref={submitBtnRef}
            className="btn-submit w-full mt-6"
        >
            Login
        </button>
    </form>
</div>

        </div>
    );
}