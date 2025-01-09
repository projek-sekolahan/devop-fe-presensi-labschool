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

export default function ChangePassword() {
    const emailRef = useRef();
    const [load, setLoad] = useState(false);
    const [errors, setErrors] = useState({email: ""});
    const submitHandler = (e) => {
        e.preventDefault();
        loading("Loading", "Verifying Email...");
        setLoad(true);

        // Validate form fields
        const validationErrors = validateFormFields({email: { value: emailRef.current.value.trim(), type: "email" }});

        // Set errors if any
        setErrors({email: validationErrors.email || ""});

        // If there are validation errors, stop form submission
        if (Object.values(validationErrors).some((error) => error)) {
            return;
        }

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
                    () => window.location.replace("/" + res.data.location)
                );
            })
            .catch((err) => {
                handleSessionError(err, "/recover");
            });
    };

    return (
        <div className="reset-container flex flex-col min-h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
            {/* Background Image */}
            <img
                src="/frontend/Icons/splash.svg"
                alt="reset"
                className="bg-image"
            />

            {/* Reset Password Form */}
            <div className="reset-form-container shadow-md">
                <h2 className="text-title text-center">Ganti Password</h2>
                <form
                    className="reset-form"
                    onSubmit={submitHandler}
                >
                    {/* Email Input */}
                    <div className="input-group">
                        <label
                            htmlFor="email"
                            className={`input-label ${
                                errors.email ? "text-red-700 font-semibold" : ""
                            }`}
                            >
                            {errors.email ? errors.email : "Email"}
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            ref={emailRef}
                            className="input-field bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
                            placeholder="Email"
                            required
                        />
                    </div>

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
                        to="/register"
                        className="text-link text-sm font-light text-white underline hover:underline"
                    >
                        Belum Punya Akun?
                    </Link>
                    <div className="flex-grow border-t-[0.25px] border-white"></div>
                </div>
            </div>
        </div>
    );
}
