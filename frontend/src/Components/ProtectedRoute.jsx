import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkSession } from "./sessionService";
import { getFormData, addDefaultKeys, getCombinedValues } from "../utils/utils";

const SESSION_KEYS = ["AUTH_KEY"];

export default function ProtectedRoute({ component: Component, isAuthenticated }) {
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      if (isAuthenticated) {
        const values = getCombinedValues(SESSION_KEYS);
        const formData = getFormData(addDefaultKeys(SESSION_KEYS), values);
        const isValid = await checkSession(localStorage.getItem("AUTH_KEY"),formData);
        setIsSessionValid(isValid);
      } else {
        setIsSessionValid(false);
      }
    };
    // Panggilan pertama untuk validasi sesi
    validateSession();
    // Buat interval untuk validasi sesi periodik
    const id = setInterval(() => {
      validateSession();
    }, 1800000); // 30 menit
    setIntervalId(id); // Simpan intervalId
    // Cleanup interval saat komponen dilepas
    return () => clearInterval(id);
  }, [isAuthenticated]);

  // Redirect ke login jika sesi tidak valid
  if (!isSessionValid) {
    return <Navigate to="/login" />;
  }
  // Jika sesi valid, Render komponen dengan intervalId diteruskan sebagai prop
  return <Component intervalId={intervalId} />;
}