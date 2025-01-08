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

// Constants for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,13}$/;
const FORM_KEYS = ["username", "phone", "namaLengkap", "sebagai", "csrf_token"];

export default function Register() {
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef();
  const numberRef = useRef();
  const emailRef = useRef();
  const navigate = useNavigate();

  // Helper function for field validation
  const validateField = (value, type) => {
    if (!value) {
      return `${type} tidak boleh kosong.`;
    }

    if (type === "email" && !EMAIL_REGEX.test(value)) {
      return "Harap masukkan email yang valid.";
    }

    if (type === "phone" && !PHONE_REGEX.test(value)) {
      return "Harap masukkan nomor telepon yang valid (10-13 digit).";
    }

    return null;
  };

  // Helper function for role validation
  const validateRole = (selectedRole) => {
    if (!selectedRole) {
      return "Harap pilih salah satu role.";
    }
    return null;
  };

  // Validate form inputs
  const validateForm = () => {
    const nameError = validateField(nameRef.current.value, "Nama");
    const phoneError = validateField(numberRef.current.value, "Nomor Telepon");
    const emailError = validateField(emailRef.current.value, "Email");
    const roleError = validateRole(role);

    if (nameError || phoneError || emailError || roleError) {
      alertMessage(
        "Input Error",
        nameError || phoneError || emailError || roleError,
        "error"
      );
      return false;
    }

    return true;
  };

  // Helper function for registration process
  const processRegister = async (formData) => {
    try {
      const response = await apiXML.postInput("register", formData);
      const res = JSON.parse(response);

      // Save CSRF token
      Cookies.set("csrf", res.csrfHash);

      // Show success message and navigate
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
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    loading("Loading", "Registering...");

    const values = [
      emailRef.current.value,
      numberRef.current.value,
      nameRef.current.value,
      role,
      Cookies.get("csrf"),
    ];
    const formData = getFormData(FORM_KEYS, values);

    try {
      await processRegister(formData);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="login-container flex flex-col min-h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
        {/* Background Image */}
        <img
            src="/frontend/img/login.png"
            alt="labschool-unesa-logo"
            className="login-bg-image"
        />

        {/* Register Form */}
        <div className="login-form-container shadow-md">
            <h2 className="text-title text-center">Daftar Sebagai</h2>
            <form
                className="login-form"
                onSubmit={handleSubmit}
            >
                {/* Role Selection */}
                <RoleSelection role={role} setRole={setRole} />

                {/* Name Input */}
                <div className="input-group">
                    <label htmlFor="name" className="input-label">
                        Nama Lengkap
                    </label>
                    <InputField
                        type="text"
                        name="namaLengkap"
                        id="name"
                        ref={nameRef}
                        placeholder="Nama Lengkap"
                        required
                    />
                </div>

                {/* Phone Input */}
                <div className="input-group">
                    <label htmlFor="number" className="input-label">
                        No Whatsapp
                    </label>
                    <InputField
                        type="tel"
                        name="phone"
                        id="number"
                        ref={numberRef}
                        placeholder="No Whatsapp"
                        required
                    />
                </div>

                {/* Email Input */}
                <div className="input-group">
                    <label htmlFor="username" className="input-label">
                        Email
                    </label>
                    <InputField
                        type="email"
                        name="username"
                        id="username"
                        ref={emailRef}
                        placeholder="Email"
                        autoComplete="username"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn-submit ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center gap-2">
                            <p className="text-white">Loading</p>
                            <span className="loading loading-spinner text-white"></span>
                        </div>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            {/* Separator with Clickable Text */}
            <div className="flex items-center gap-2 w-full mt-4">
                <div className="flex-grow border-t-[0.25px] border-white"></div>
                <Link
                    to="/login"
                    className="text-sm font-light text-white underline hover:underline"
                >
                    Sudah Punya Akun?
                </Link>
                <div className="flex-grow border-t-[0.25px] border-white"></div>
            </div>

        </div>
    </div>
    );
}