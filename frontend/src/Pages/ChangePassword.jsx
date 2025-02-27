import { useRef, useState } from "react";
import ApiService from "../utils/ApiService";
import { getFormData, alertMessage, addDefaultKeys, getCombinedValues } from "../utils/utils";
import { validateFormFields } from "../utils/validation";
import renderInputGroup from "../Components/renderInputGroup";
import ToggleButton from "../Components/ToggleButton";

export default function ChangePassword({ isOpen, onToggle }) {
    const emailRef = useRef();
    const [email, setEmail] = useState("");
    const [loadingState, setLoadingState] = useState(false);
    const [errors, setErrors] = useState({ email: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi input email
        const validationErrors = validateFormFields({ email: { value: email.trim(), type: "email" } });
        setErrors({ email: validationErrors.email || "" });

        if (Object.values(validationErrors).some(Boolean)) return;

        setLoadingState(true);

        // Siapkan data untuk request
        const formValues = [email.trim()];
        const storedValues = getCombinedValues([]);
        const sanitizedKeys = addDefaultKeys(["username"]).filter(key => key !== "devop-sso");
        const formData = getFormData(sanitizedKeys, [...formValues, ...storedValues].filter(Boolean));

        try {
            const res = await ApiService.processApiRequest("recover", formData, null, true);
            if (res?.data) {
                localStorage.setItem("email", email);
                alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location));
            }
        } finally {
            setLoadingState(false);
        }
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
                    onSubmit={handleSubmit}
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
                        onChange: (e) => setEmail(e.target.value),
                    })}
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loadingState}
                        className={`btn-submit ${
                            loadingState ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loadingState ? (
                            <div className="flex justify-center items-center gap-2">
                                <p className="text-white">Loading</p>
                                <span className="loading loading-spinner text-white"></span>
                            </div>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
                {/* Separator with Clickable Text */}
                <div className="flex items-center gap-2 w-full mt-4">
                    <div className="flex-grow border-t-[0.25px] border-white"></div>
                    <div className="flex-grow border-t-[0.25px] border-white"></div>
                </div>
            </div>
            {/* Toggle Button */}
            <ToggleButton isOpen={isOpen} onToggle={onToggle} />
        </div>
    );
}