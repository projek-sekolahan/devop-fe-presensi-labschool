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

    const validateAndSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateFormFields({ email: { value: email.trim(), type: "email" } });
        setErrors(validationErrors);
        if (Object.values(validationErrors).some(Boolean)) return;
        setLoadingState(true);
        const formData = getFormData(addDefaultKeys(["username"]), [email.trim(), ...getCombinedValues([])]);
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
            <img src="/frontend/Icons/splash.svg" alt="reset" className={`bg-image ${isOpen ? "open" : ""}`} />
            <div className={`reset-form-container ${isOpen ? "open" : "closed"}`}>
                <h2 className="text-title text-4xl">Ganti Password</h2>
                <form className="reset-form" onSubmit={validateAndSubmit}>
                    {renderInputGroup({
                        id: "email",
                        label: "Email",
                        type: "email",
                        inputRef: emailRef,
                        placeholder: "Email",
                        autoComplete: "email",
                        error: errors.email,
                        onChange: (e) => setEmail(e.target.value),
                    })}
                    <button
                        type="submit"
                        disabled={loadingState}
                        className={`btn-submit ${loadingState ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loadingState ? "Processing..." : "Reset Password"}
                    </button>
                </form>
                <div className="flex items-center gap-2 w-full mt-4">
                    <div className="flex-grow border-t-[0.25px] border-white"></div>
                    <div className="flex-grow border-t-[0.25px] border-white"></div>
                </div>
            </div>
            <ToggleButton isOpen={isOpen} onToggle={onToggle} />
        </div>
    );
}