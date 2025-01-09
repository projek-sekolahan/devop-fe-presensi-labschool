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
import { validateFormFields } from "../utils/validation";

// Constants for form fields and keys
const FORM_KEYS = ["username", "phone", "namaLengkap", "sebagai", "csrf_token"];

export default function Register() {
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef();
  const numberRef = useRef();
  const emailRef = useRef();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
  });

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
    // Define fields for validation
    const fields = {
        name: { value: nameRef.current.value.trim(), type: "text" },
        phone: { value: numberRef.current.value.trim(), type: "phone" },
        email: { value: emailRef.current.value.trim(), type: "email" },
        role: { value: role, type: "role" },
    };

    // Validate form fields
    const validationErrors = validateFormFields(fields);

    // Set errors if any
    setErrors({
        name: validationErrors.name || "",
        phone: validationErrors.phone || "",
        email: validationErrors.email || "",
        role: validationErrors.role || "",
    });

    // If there are validation errors, stop form submission
    if (Object.values(validationErrors).some((error) => error)) {
        return;
    }

    setIsLoading(true);
    loading("Loading", "Registering...");

    // Prepare form data for submission
    const values = [
        emailRef.current.value,
        numberRef.current.value,
        nameRef.current.value,
        role,
        Cookies.get("csrf"),
    ];
    const formData = getFormData(FORM_KEYS, values);

    try {
        // Process registration
        await processRegister(formData);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="register-container flex flex-col min-h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
      {/* Background Image */}
      <img
        src="/frontend/Icons/splash.svg"
        alt="labschool-unesa-logo"
        className="bg-image"
      />

      {/* Register Form */}
      <div className="register-form-container shadow-md">
        <h2 className="text-title text-center">Daftar Sebagai</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <RoleSelection role={role} setRole={setRole} error={errors.role} />

          {/* Name Input */}
          <div className="input-group">
            <label
              htmlFor="name"
              className={`input-label ${
                errors.name ? "text-red-500" : ""
              }`}
            >
              {errors.name ? errors.name : "Nama Lengkap"}
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
            <label
              htmlFor="number"
              className={`input-label ${
                errors.phone ? "text-red-500" : ""
              }`}
            >
              {errors.phone ? errors.phone : "No Whatsapp"}
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
            <label
              htmlFor="username"
              className={`input-label ${
                errors.email ? "text-red-500" : ""
              }`}
            >
              {errors.email ? errors.email : "Email"}
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
            className="text-link text-sm font-light text-white underline hover:underline"
          >
            Sudah Punya Akun?
          </Link>
          <div className="flex-grow border-t-[0.25px] border-white"></div>
        </div>
      </div>
    </div>
  );
}
