import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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

// Constants for form fields and keys
const FORM_KEYS = ["username", "password"];
const TOKEN_KEYS = ["AUTH_KEY", "devop-sso"];
const CSRF_KEY = "csrf";

// Helper function for form validation
const validateField = (value, type) => {
  if (type === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
    return "Email tidak valid.";
  }
  if (type === "password" && value.length < 8) {
    return "Password harus minimal 8 karakter.";
  }
  return null;
};

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
    const [startY, setStartY] = useState(0); // Start position for swipe
    const [endY, setEndY] = useState(0); // End position for swipe
    const [isSwipeUp, setIsSwipeUp] = useState(false); // State for swipe direction
    const loginFormContainerRef = useRef(null); // Ref to login form container
    // Validate form inputs before submitting
    const validateForm = () => {
        const emailValue = emailRef.current.value.trim();
        const passwordValue = passwordRef.current.value;

        const emailError = validateField(emailValue, "email");
        const passwordError = validateField(passwordValue, "password");

        if (emailError) return emailError;
        if (passwordError) return passwordError;

        return null;
    };

    // Handle form submission
    const handleLogin = async (e) => {
        e.preventDefault();

        const errorMessage = validateForm();
        if (errorMessage) {
        alertMessage("Validasi Gagal", errorMessage, "error", () => window.location.replace("/login"));
        return;
        }

        const emailValue = emailRef.current.value.trim();
        const passwordValue = passwordRef.current.value;
        const hash = getHash(passwordValue);
        const tokenKey = getKey(emailValue, hash);

        const values = [emailValue, hash, tokenKey[1], Cookies.get(CSRF_KEY)];
        const formData = getFormData(addDefaultKeys(FORM_KEYS), values);

        // Save temporary keys in localStorage
        localStorage.setItem(TOKEN_KEYS[0], tokenKey[0]);
        localStorage.setItem(TOKEN_KEYS[1], tokenKey[1]);

        try {
        const loginResponse = await processLogin(formData, tokenKey);

        // Success alert and redirect
        alertMessage(
            "Berhasil",
            loginResponse.message,
            "success",
            () => window.location.replace("/home")
        );
        } catch (error) {
        // Handle error during login
        console.error("Login error:", error);
        }
    };

    // Detect swipe gestures
    const handleTouchStart = (e) => {
        const touchStartY = e.touches[0].clientY;
        setStartY(touchStartY); // Store starting Y position
    };

    const handleTouchEnd = (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        setEndY(touchEndY); // Store ending Y position

        // Swipe Up Gesture: Start Y - End Y > 50px
        if (startY - endY > 50) {
        setIsSwipeUp(true); // Swipe Up Detected
        loginFormContainerRef.current.classList.add("slide-up"); // Trigger slide-up animation
        loginFormContainerRef.current.style.display = "block"; // Make sure it is visible
        }

        // Swipe Down Gesture: End Y - Start Y > 50px
        if (endY - startY > 50) {
        setIsSwipeUp(false); // Swipe Down Detected
        loginFormContainerRef.current.classList.add("slide-down"); // Trigger slide-down animation
        }
    };

    // Clean up event listeners when the component is unmounted
    useEffect(() => {
        const loginFormContainer = loginFormContainerRef.current;
        loginFormContainer.addEventListener("touchstart", handleTouchStart);
        loginFormContainer.addEventListener("touchend", handleTouchEnd);

        // Cleanup
        return () => {
        loginFormContainer.removeEventListener("touchstart", handleTouchStart);
        loginFormContainer.removeEventListener("touchend", handleTouchEnd);
        };
    }, [startY, endY]);

    // Use the `isSwipeUp` state to conditionally render or modify behavior
    useEffect(() => {
        if (isSwipeUp) {
        // Perform action when swipe-up is detected
        console.log("Swipe Up Detected! Showing login form...");
        
        // Display the login form (ensure it's not hidden)
        loginFormContainerRef.current.style.display = "block"; 
        
        // Optionally, you can add other actions such as triggering animations
        loginFormContainerRef.current.classList.remove("slide-down"); // Remove slide-down class if it was added before
        loginFormContainerRef.current.classList.add("slide-up"); // Trigger slide-up animation
        
        // Any other action on swipe-up
        // Example: Show a message, perform an animation, etc.
        } else {
        // Perform action when swipe-down is detected
        console.log("Swipe Down Detected! Hiding login form...");

        // Optionally, you can add logic to hide the login form or perform other actions
        loginFormContainerRef.current.classList.remove("slide-up"); // Remove slide-up class if it was added before
        loginFormContainerRef.current.classList.add("slide-down"); // Trigger slide-down animation
        
        // Hide the login form after animation completes
        loginFormContainerRef.current.style.display = "none"; // Hide form after swipe-down animation
        }
    }, [isSwipeUp]); // This will run when `isSwipeUp` state changes

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
                        className="btn-submit w-full mt-6"
                    >
                        Login
                    </button>
                </form>
            </div>

        </div>
    );
}