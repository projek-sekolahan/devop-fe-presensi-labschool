import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import PasswordShow from "../Components/PasswordShow";
import ApiService from "../utils/ApiService.js";
import { getHash, getKey, getFormData, alertMessage, loading, addDefaultKeys, getCombinedValues } from "../utils/utils.js";
import { validateFormFields } from "../utils/validation";
import renderInputGroup from "../Components/renderInputGroup";
import ToggleButton from "../Components/ToggleButton";

// Constants for form fields and keys
const FORM_KEYS = ["username", "password"];
const TOKEN_KEYS = ["AUTH_KEY", "devop-sso"];

export default function Login({ isOpen, onToggle }) {
    // Refs for input elements
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const submitBtnRef = useRef(null);
    const [errors, setErrors] = useState({
        password: "",
        email: "",
    });

    // Mendapatkan CSRF Token
    ApiService.getCsrf();
    // Handle form submission
    const handleLogin = async (e) => {
        e.preventDefault();

        // Define fields for validation
        const fields = {
            password: { value: passwordRef.current.value.trim(), type: "password" },
            email: { value: emailRef.current.value.trim(), type: "email" },
        };
        // Validate form fields
        const validationErrors = validateFormFields(fields);

        // Set errors if any
        setErrors({
            password: validationErrors.password || "",
            email: validationErrors.email || "",
        });
        
        // If there are validation errors, stop form submission
        if (Object.values(validationErrors).some((error) => error)) {
            return;
        }

        const emailValue = emailRef.current.value.trim();
        const passwordValue = passwordRef.current.value.trim();
        const hash = getHash(passwordValue);
        const tokenKey = getKey(emailValue, hash);
        // Save temporary keys in localStorage
        localStorage.setItem(TOKEN_KEYS[0], tokenKey[0]);
        localStorage.setItem(TOKEN_KEYS[1], tokenKey[1]);
        // Data user yang di-input
        const userValues = [emailValue, hash];
const storedValues = getCombinedValues(["devop-sso", "csrf_token"]);

console.log("🔹 storedValues setelah getCombinedValues:", storedValues);

// Pastikan csrf_token memiliki nilai yang benar
const values = [...userValues, ...storedValues];

        const formData = getFormData(addDefaultKeys(FORM_KEYS), values);
        loading("Loading", "Logging in...");
console.log("🔹 Final keys:", addDefaultKeys(FORM_KEYS));
console.log("🔹 Final values:", values);
console.log("🔹 Final formData:", formData); return false;
        const loginResponse = await ApiService.processApiRequest("auth/login", formData, tokenKey[0]);
        // Save tokens in secure storage
        localStorage.setItem("login_token", loginResponse.data.token);
        if (loginResponse.status==false) {
            // error alert and redirect
            alertMessage(
                loginResponse.title,
                loginResponse.message,
                "error",
                () => window.location.replace("/login")
            );
        } else {
            // Success alert and redirect
            alertMessage(
                "Berhasil",
                loginResponse.message,
                "success",
                () => window.location.replace("/home")
            );
        }
    };

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
                inputRef: emailRef,
                placeholder: "Email",
                autoComplete: "username",
                error: errors.email,
            })}
            {/* Password Input */}
            {renderInputGroup({
                id: "password",
                label: "Password",
                type: "password",
                inputRef: passwordRef,
                placeholder: "Password (8 or more characters)",
                autoComplete: "current-password",
                error: errors.password,
                additionalElement: <PasswordShow ref={passwordRef} />,
            })}
            {/* Forgot Password and Register Link */}
            <div className="flex justify-between items-center text-sm">
                <Link to="#" onClick={() => onToggle("recover")} className="text-link ml-auto">
                    Lupa password?
                </Link>
            </div>
            {/* Submit Button */}
            <button
                type="submit"
                ref={submitBtnRef}
                className="btn-submit"
            >
                Login
            </button>
        </form>
    </div>
    {/* Toggle Button */}
    <ToggleButton isOpen={isOpen} onToggle={onToggle} />
</div>
    );
}