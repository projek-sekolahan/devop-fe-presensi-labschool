import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkSession } from "./sessionService"; // Import fungsi checkSession
import { getFormData, addDefaultKeys } from "../utils/utils";
import Cookies from "js-cookie";

const SESSION_KEYS = ["AUTH_KEY"];
const getCombinedValues = (keys) => {
  const combinedKeys = addDefaultKeys(keys);
  return combinedKeys.map((key) => {
    let value = localStorage.getItem(key);
    if (key === "csrf_token" && !value) value = Cookies.get("csrf");
    return value;
  });
};

export default function ProtectedRoute({ component: Component, isAuthenticated }) {
  const [isSessionValid, setIsSessionValid] = useState(true); // Status sesi
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      if (isAuthenticated) {
        const values = getCombinedValues(SESSION_KEYS);
        const formData = getFormData(addDefaultKeys(SESSION_KEYS), values);
        const isValid = await checkSession(values[0],formData);
        setIsSessionValid(isValid);
      } else {
        setIsSessionValid(false); // Tidak autentikasi berarti sesi invalid
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