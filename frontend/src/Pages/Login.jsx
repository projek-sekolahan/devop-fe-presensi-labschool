import { Link } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import PasswordShow from "../Components/PasswordShow";
import ApiService from "../utils/ApiService.js";
import { getHash, getKey, getFormData, alertMessage, addDefaultKeys, getCombinedValues } from "../utils/utils.js";
import { validateFormFields } from "../utils/validation";
import renderInputGroup from "../Components/renderInputGroup";
import ToggleButton from "../Components/ToggleButton";

// Constants for form fields and keys
const FORM_KEYS = ["username", "password"];
const TOKEN_KEYS = ["AUTH_KEY", "devop-sso"];

export default function Login({ isOpen, onToggle }) {
    // State untuk email dan password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "" });

    const submitBtnRef = useRef(null);

    // Mendapatkan CSRF Token
    ApiService.getCsrf();

    // Handle form submission
    const handleLogin = useCallback(async (e) => {
        e.preventDefault();
        
        // Validasi input
        const validationErrors = validateFormFields({
            email: { value: email.trim(), type: "email" },
            password: { value: password.trim(), type: "password" },
        });

        setErrors(validationErrors);

        if (Object.values(validationErrors).some((error) => error)) return;

        const hash = getHash(password);
        const tokenKey = getKey(email, hash);
        const userValues = [email, hash];
        const storedValues = getCombinedValues([]);
        const values = [...userValues, ...storedValues];
        const formData = getFormData(addDefaultKeys(FORM_KEYS), values);

        const loginResponse = await ApiService.processApiRequest("auth/login", formData, tokenKey[0], true);

        if (loginResponse?.status) {
            localStorage.setItem(TOKEN_KEYS[0], tokenKey[0]);
            localStorage.setItem(TOKEN_KEYS[1], tokenKey[1]);
            localStorage.setItem("login_token", loginResponse.data.token);

            alertMessage("Berhasil", loginResponse.message, "success", () => window.location.replace("/home"));
        } else {
            alertMessage(loginResponse.title, loginResponse.message, "error", () => window.location.replace("/login"));
        }
    }, [email, password]);

    return (
        <div className="login-container">
            {/* Background Image */}
            <img
                src="/frontend/Icons/splash.svg"
                alt="labschool-unesa-logo"
                className={`bg-image ${isOpen ? "open" : ""}`}
            />

            {/* Login Form */}
            <div className={`login-form-container ${isOpen ? "open" : "closed"}`}>
                <h2 className="text-title text-4xl">Yuk Login!</h2>
                <p className="text-subtitle">Solusi Pintar Sekolah Digital</p>
                <form className="login-form" onSubmit={handleLogin}>
                    {/* Email Input */}
                    {renderInputGroup({
                        id: "email",
                        label: "Email",
                        type: "email",
                        placeholder: "Email",
                        autoComplete: "username",
                        error: errors.email,
                        onChange: (e) => setEmail(e.target.value),
                    })}
                    
                    {/* Password Input */}
                    {renderInputGroup({
                        id: "password",
                        label: "Password",
                        type: "password",
                        placeholder: "Password (8 or lebih karakter)",
                        autoComplete: "current-password",
                        error: errors.password,
                        onChange: (e) => setPassword(e.target.value),
                        additionalElement: <PasswordShow />,
                    })}

                    {/* Forgot Password and Register Link */}
                    <div className="flex justify-between items-center text-sm">
                        <Link to="#" onClick={() => onToggle("recover")} className="text-link ml-auto">
                            Lupa password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" ref={submitBtnRef} className="btn-submit">
                        Login
                    </button>
                </form>
            </div>

            {/* Toggle Button */}
            <ToggleButton isOpen={isOpen} onToggle={onToggle} />
        </div>
    );
}