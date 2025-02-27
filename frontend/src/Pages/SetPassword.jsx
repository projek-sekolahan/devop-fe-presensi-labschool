import { useRef, useState } from "react";
import { getFormData, getHash, alertMessage, addDefaultKeys, getCombinedValues } from "../utils/utils";
import ApiService from "../utils/ApiService";
import PasswordShow from "../Components/PasswordShow";
import { validateFormFields } from "../utils/validation";

export default function SetPassword({ isOpen, onToggle }) {
    const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef();
    const confirmRef = useRef();

    const validatePasswords = () => {
        const password = inputRef.current.value.trim();
        const confirmPassword = confirmRef.current.value.trim();
        let validationErrors = validateFormFields({ password: { value: password, type: "password" } });

        if (confirmPassword && password !== confirmPassword) {
            validationErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(validationErrors);
        return Object.values(validationErrors).every((error) => !error);
    };

    const handleChange = () => validatePasswords();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords()) return;

        setIsSubmitting(true);
        const keys = ["password"];
        const values = [getHash(inputRef.current.value), ...getCombinedValues([])];
        const formData = getFormData(addDefaultKeys(keys), values);

        try {
            const res = await ApiService.processApiRequest("setPassword", formData, null, true);
            if (res?.data) {
                alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="confirmation-container">
            <img src="/frontend/Icons/splash.svg" alt="reset" className={`bg-image ${isOpen ? "open" : ""}`} />
            <div className={`confirmation-form-container ${isOpen ? "open" : "closed"}`}>
                <h2 className="text-title text-4xl">Set Password</h2>
                <form onSubmit={handleSubmit} className="confirmation-form">
                    <div className="input-group">
                        <label htmlFor="password" className={`input-label ${errors.password ? "text-red-700 font-semibold" : ""}`}>
                            {errors.password || "Password"}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                id="password"
                                placeholder="Password (8 or more characters)"
                                className="input-field"
                                ref={inputRef}
                                onChange={handleChange}
                                required
                            />
                            <PasswordShow ref={inputRef} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirm-password" className={`input-label ${errors.confirmPassword ? "text-red-700 font-semibold" : ""}`}>
                            {errors.confirmPassword || "Confirm Password"}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                id="confirm-password"
                                placeholder="Confirm your password"
                                className="input-field"
                                ref={confirmRef}
                                onChange={handleChange}
                                required
                            />
                            <PasswordShow ref={confirmRef} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`btn-submit ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? "Processing..." : "Confirm Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}