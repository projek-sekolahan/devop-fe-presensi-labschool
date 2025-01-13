import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import apiXML from "../utils/apiXML";
import {
    getFormData,
    alertMessage,
    loading,
    handleSessionError,
} from "../utils/utils";
import Cookies from "js-cookie";
import { validateFormFields } from "../utils/validation";
import renderInputGroup from "../Components/renderInputGroup";
import ToggleButton from "../Components/ToggleButton";

export default function ChangePassword({ isOpen, onToggle }) {
    const emailRef = useRef();
    const [load, setLoad] = useState(false);
    const [errors, setErrors] = useState({email: ""});

    const submitHandler = (e) => {
        e.preventDefault();

        // Validate form fields
        const validationErrors = validateFormFields({email: { value: emailRef.current.value.trim(), type: "email" }});

        // Set errors if any
        setErrors({email: validationErrors.email || ""});

        // If there are validation errors, stop form submission
        if (Object.values(validationErrors).some((error) => error)) {
            return;
        }
        
        loading("Loading", "Verifying Email...");
        setLoad(true);

        const key = ["username", "csrf_token"];
        const values = [emailRef.current.value.trim(), Cookies.get("csrf")];
        localStorage.setItem("email", emailRef.current.value);

        apiXML
            .postInput("recover", getFormData(key, values))
            .then((res) => {
                res = JSON.parse(res);
                Cookies.set("csrf", res.csrfHash);
                setLoad(false);
                alertMessage(
                    res.data.title,
                    res.data.message,
                    res.data.info,
                    () => onToggle("/" + res.data.location)
                );
            })
            .catch((err) => {
                handleSessionError(err, "/recover");
            });
    };

    return (
        <div className="reset-container">
            {/* Background Image */}
            <img
                src="/frontend/Icons/splash.svg"
                alt="reset"
                className={`bg-image ${isOpen ? "open" : ""}`}
            />

            {/* Reset Password Form */}
            <div className={`reset-form-container ${isOpen ? "open" : "closed"}`}>
                <h2 className="text-title text-4xl">Ganti Password</h2>
                <form
                    className="reset-form"
                    onSubmit={submitHandler}
                >
                    {/* Email Input */}
                    {renderInputGroup({
                        id: "email",
                        label: "Email",
                        type: "email",
                        inputRef: emailRef,
                        placeholder: "Email",
                        autoComplete: "Email",
                        error: errors.email,
                    })}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={load}
                        className={`btn-submit ${
                            load ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {load ? (
                            <div className="flex justify-center items-center gap-2">
                                <p className="text-white">Loading</p>
                                <span className="loading loading-spinner text-white"></span>
                            </div>
                        ) : (
                            "Ganti Password"
                        )}
                    </button>
                </form>

                {/* Separator with Clickable Text */}
                <div className="flex items-center gap-2 w-full mt-4">
                    <div className="flex-grow border-t-[0.25px] border-white"></div>
                    <Link
                        to="#" onClick={() => onToggle("register")}
                        className="text-link text-sm font-light text-white underline hover:underline"
                    >
                        Belum Punya Akun?
                    </Link>
                    <div className="flex-grow border-t-[0.25px] border-white"></div>
                </div>
            </div>
            {/* Toggle Button */}
            <ToggleButton isOpen={isOpen} onToggle={onToggle} />
        </div>
    );
}
