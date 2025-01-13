import { Link } from "react-router-dom";
import { useRef, useState } from "react";
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
import { validateFormFields } from "../utils/validation";
import renderInputGroup from "../Components/renderInputGroup";
import ToggleButton from "../Components/ToggleButton";

// Constants for form fields and keys
const FORM_KEYS = ["username", "password"];
const TOKEN_KEYS = ["AUTH_KEY", "devop-sso"];
const CSRF_KEY = "csrf";

// Helper function for login processing
const processLogin = async (formData, tokenKey) => {
  try {
    loading("Loading", "Logging in...");
    const response = await apiXML.authPost("login", tokenKey[0], formData);
    const loginResponse = JSON.parse(response);

    // Save tokens in secure storage
    localStorage.setItem("login_token", loginResponse.data.token);
    Cookies.set(CSRF_KEY, loginResponse.csrfHash);

    return loginResponse.data;
  } catch (error) {
    handleSessionError(error, "/login");
    throw error; // Ensure error is propagated
  }
};

export default function Login() {
    // Refs for input elements
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const submitBtnRef = useRef(null);
    const [errors, setErrors] = useState({
        password: "",
        email: "",
    });
    const [isOpen, setIsOpen] = useState(false);

    const toggleForm = () => {
        setIsOpen(!isOpen);
    };

    // Mendapatkan CSRF Token
    apiXML.getCsrf();
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
        
        const values = [emailValue, hash, tokenKey[1], Cookies.get(CSRF_KEY)];
        const formData = getFormData(addDefaultKeys(FORM_KEYS), values);

        // Save temporary keys in localStorage
        localStorage.setItem(TOKEN_KEYS[0], tokenKey[0]);
        localStorage.setItem(TOKEN_KEYS[1], tokenKey[1]);

        try {
        const loginResponse = await processLogin(formData, tokenKey);
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
        } catch (error) { alert(error)
        // Handle error during login
        console.error("Login error:", error);
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
                <Link to="/register" className="text-link">
                    Belum Punya Akun?
                </Link>
                <Link to="/recover" className="text-link">
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
    <ToggleButton isOpen={isOpen} onToggle={toggleForm} />
</div>
    );
}