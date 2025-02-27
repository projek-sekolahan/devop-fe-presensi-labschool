import { Link } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import PasswordShow from "../Components/PasswordShow";
import ApiService from "../utils/ApiService";
import { getHash, getKey, getFormData, alertMessage, addDefaultKeys, getCombinedValues } from "../utils/utils";
import { validateFormFields } from "../utils/validation";
import renderInputGroup from "../Components/renderInputGroup";
import ToggleButton from "../Components/ToggleButton";

const FORM_KEYS = ["username", "password"];
const TOKEN_KEYS = ["AUTH_KEY", "devop-sso"];

export default function Login({ isOpen, onToggle }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const submitBtnRef = useRef(null);
    const passwordRef = useRef(null);
    const emailRef = useRef(null);

    ApiService.getCsrf();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleLogin = useCallback(async (e) => {
        e.preventDefault();
        
        const validationErrors = validateFormFields({
            email: { value: formData.email.trim(), type: "email" },
            password: { value: formData.password.trim(), type: "password" },
        });
        setErrors(validationErrors);
        if (Object.values(validationErrors).some(Boolean)) return;
        const hash = getHash(formData.password);
        const tokenKey = getKey(formData.email, hash);
        const values = [formData.email, hash, ...getCombinedValues([])];
        const formPayload = getFormData(addDefaultKeys(FORM_KEYS), values);
        const response = await ApiService.processApiRequest("auth/login", formPayload, tokenKey[0], true);
        if (response?.status) {
            localStorage.setItem(TOKEN_KEYS[0], tokenKey[0]);
            localStorage.setItem(TOKEN_KEYS[1], tokenKey[1]);
            localStorage.setItem("login_token", response.data.token);
            alertMessage("Berhasil", response.message, "success", () => window.location.replace("/home"));
        } else {
            alertMessage(response.title, response.message, "error", () => window.location.replace("/login"));
        }
    }, [formData]);

    return (
        <div className="login-container">
            <img src="/frontend/Icons/splash.svg" alt="labschool-unesa-logo" className={`bg-image ${isOpen ? "open" : ""}`} />
            <div className={`login-form-container ${isOpen ? "open" : "closed"}`}>
                <h2 className="text-title text-4xl">Yuk Login!</h2>
                <p className="text-subtitle">Solusi Pintar Sekolah Digital</p>
                <form className="login-form" onSubmit={handleLogin}>
                    {renderInputGroup({
                        id: "email",
                        label: "Email",
                        type: "email",
                        placeholder: "Email",
                        autoComplete: "username",
                        error: errors.email,
                        inputRef: emailRef,
                        onChange: handleInputChange,
                    })}
                    {renderInputGroup({
                        id: "password",
                        label: "Password",
                        type: "password",
                        placeholder: "Password (8 atau lebih karakter)",
                        autoComplete: "current-password",
                        error: errors.password,
                        onChange: handleInputChange,
                        inputRef: passwordRef,
                        additionalElement: <PasswordShow ref={passwordRef} />,
                    })}
                    <div className="flex justify-between items-center text-sm">
                        <Link to="#" onClick={() => onToggle("recover")} className="text-link ml-auto">
                            Lupa password?
                        </Link>
                    </div>
                    <button type="submit" ref={submitBtnRef} className="btn-submit">Login</button>
                </form>
            </div>
            <ToggleButton isOpen={isOpen} onToggle={onToggle} />
        </div>
    );
}