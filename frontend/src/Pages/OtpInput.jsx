import { useState, useRef, useEffect, useCallback } from "react";
import ApiService from "../utils/ApiService";
import { getFormData, alertMessage, getCombinedValues, addDefaultKeys } from "../utils/utils";

export default function OtpInput({ isOpen, onToggle }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // fokus saat pertama mount dan saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [isOpen]);

  // countdown menggunakan timeout agar tidak membuat banyak interval
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, ""); // Hanya angka
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // ambil digit terakhir saja
    setOtp(newOtp);
    // jika ada angka dan bukan index terakhir, focus ke next
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[index]) {
        // jika ada nilai di posisi ini, kosongkan saja
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // jika kosong, pindah ke sebelumnya dan kosongkan sebelumnya
        inputRefs.current[index - 1]?.focus();
        const prev = [...otp];
        prev[index - 1] = "";
        setOtp(prev);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // handle paste (paste 4 digit)
  const handlePaste = (e) => {
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pasted.replace(/\D/g, "").slice(0, otp.length).split("");
    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i];
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, otp.length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
    e.preventDefault();
  };

  const submitOtp = useCallback(async () => {
    setIsLoading(true);
    try {
      // prepare keys untuk setiap digit
      const digitKeys = otp.map(() => "digit-input[]");
      // setiap digit harus dikirim — jika kosong, kirim "null" (sesuai utilitas getFormData sebelumnya)
      const digitValues = otp.map((d) => (d ? d : "null"));

      // final keys dan values: append default keys (devop-sso, csrf_token)
      const finalKeys = addDefaultKeys(digitKeys); // menghasilkan [digit-input[],..., "devop-sso","csrf_token"]
      // ambil nilai default keys dengan getCombinedValues([]) -> returns [devop-ssoValue, csrf_tokenValue]
      const defaultValues = getCombinedValues([]); // sesuai util.js design
      const finalValues = [...digitValues, ...defaultValues];

      // build query string
      const formData = getFormData(finalKeys, finalValues);

      const res = await ApiService.processApiRequest("verify", formData, null, true);
      if (res?.status) {
        localStorage.setItem("regist_token", res.data.data.token);
        alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle("facereg"));
      } else {
        // fallback: tampilkan pesan lalu tetap ke verify
        alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle("verify"));
      }
    } catch (err) {
      // opsional: tangani error network / unexpected
      alertMessage("Error", "Terjadi kesalahan, coba lagi.", "error", () => {});
    } finally {
      setIsLoading(false);
    }
  }, [otp, onToggle]);

  const resendOtp = useCallback(async () => {
    setIsLoading(true);
    try {
      const keys = addDefaultKeys(["email"]); // ["email", "devop-sso", "csrf_token"]
      const email = localStorage.getItem("email") || "null";
      const defaultValues = getCombinedValues([]); // [devop-ssoValue, csrf_tokenValue]
      const values = [email, ...defaultValues];
      const formData = getFormData(keys, values);

      const res = await ApiService.processApiRequest("sendOTP", formData, null, false);
      if (res?.data) {
        alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location));
        setCountdown(60); // restart countdown
      } else {
        // fallback bila API tidak mengembalikan data
        alertMessage("Gagal", "Tidak dapat mengirim ulang OTP.", "error", () => {});
      }
    } catch (err) {
      alertMessage("Error", "Terjadi kesalahan saat mengirim ulang OTP.", "error", () => {});
    } finally {
      setIsLoading(false);
    }
  }, [onToggle]);

  return (
    <div className="verification-container">
      <img src="/frontend/Icons/splash.svg" alt="Verification" className={`bg-image ${isOpen ? "open" : ""}`} />
      <div className={`verification-form-container ${isOpen ? "open" : "closed"}`}>
        <h2 className="text-title text-xl">Email Verification</h2>
        <p className="text-sm text-center">Cek Email Anda (Masukkan Kode OTP)</p>

        <div className="flex justify-between my-4">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              value={value}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-16 h-16 bg-white text-black font-semibold text-lg text-center rounded-lg focus:border-black focus:border-3"
            />
          ))}
        </div>

        <p className="text-center font-light text-xs my-2">
          Tidak Menerima Kode OTP?{" "}
          {countdown > 0 ? (
            <span className="text-gray-400 font-semibold">Kirim ulang dalam {countdown}s</span>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                resendOtp();
              }}
              className="text-link font-bold underline"
            >
              Klik Disini
            </a>
          )}
        </p>

        <button
          type="button"
          onClick={submitOtp}
          disabled={isLoading}
          className={`btn-submit ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Processing..." : "Verification OTP"}
        </button>
      </div>
    </div>
  );
}
