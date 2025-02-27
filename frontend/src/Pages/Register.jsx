import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import ApiService from "../utils/ApiService.js";
import { getFormData, alertMessage, handleSessionError, getCombinedValues, addDefaultKeys } from "../utils/utils";
import RoleSelection from "../Components/RoleSelection";
import renderInputGroup from "../Components/renderInputGroup";
import { validateFormFields } from "../utils/validation";
import ToggleButton from "../Components/ToggleButton";

const FORM_KEYS = ["username", "phone", "namaLengkap", "sebagai"];

export default function Register({ isOpen, onToggle }) {
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef(null);
  const numberRef = useRef(null);
  const emailRef = useRef(null);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fields = {
      namaLengkap: { value: nameRef.current.value.trim(), type: "text" },
      phone: { value: numberRef.current.value.trim(), type: "phone" },
      username: { value: emailRef.current.value.trim(), type: "email" },
      role: { value: role, type: "role" },
    };

    const validationErrors = validateFormFields(fields);
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) return;

    setIsLoading(true);
    const values = [
      emailRef.current.value,
      numberRef.current.value,
      nameRef.current.value,
      role,
      ...getCombinedValues([]),
    ].filter(Boolean);

    const sanitizedKeys = addDefaultKeys(FORM_KEYS).filter((key) => key !== "devop-sso");
    const formData = getFormData(sanitizedKeys, values);

    try {
      const res = await ApiService.processApiRequest("register", formData, null, true);
      if (res?.data) {
        alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location || "register"));
      }
    } catch (err) {
      handleSessionError(err, "/register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <img src="/frontend/Icons/splash.svg" alt="labschool-unesa-logo" className={`bg-image ${isOpen ? "open" : ""}`} />
      <div className={`register-form-container ${isOpen ? "open" : "closed"}`}>
        <h2 className="text-title text-4xl">Daftar Sebagai</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <RoleSelection role={role} setRole={setRole} error={errors.role} />
          {renderInputGroup({ id: "namaLengkap", label: "Nama Lengkap", type: "text", inputRef: nameRef, placeholder: "Nama Lengkap", error: errors.namaLengkap })}
          {renderInputGroup({ id: "number", label: "No Whatsapp", type: "tel", inputRef: numberRef, placeholder: "No Whatsapp", error: errors.phone })}
          {renderInputGroup({ id: "username", label: "Email", type: "email", inputRef: emailRef, placeholder: "Email", error: errors.username })}
          <button
            type="submit"
            disabled={isLoading}
            className={`btn-submit ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>
        <div className="flex items-center gap-2 w-full mt-4">
          <div className="flex-grow border-t-[0.25px] border-white"></div>
          <Link to="#" onClick={(e) => { e.preventDefault(); onToggle("recover"); }} className="text-link text-sm font-light text-white underline">Lupa Password?</Link>
          <div className="flex-grow border-t-[0.25px] border-white"></div>
        </div>
      </div>
      <ToggleButton isOpen={isOpen} onToggle={onToggle} />
    </div>
  );
}