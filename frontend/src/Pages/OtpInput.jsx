import { useState, useRef, useEffect, useCallback } from "react";
import ApiService from "../utils/ApiService";
import { getFormData, alertMessage, getCombinedValues, addDefaultKeys } from "../utils/utils";

export default function OtpInput({ isOpen, onToggle }) {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
        if (countdown === 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (index, e) => {
        const value = e.target.value.replace(/\D/g, ""); // Hanya angka
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Ambil digit terakhir
        setOtp(newOtp);
        if (index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
			const newOtp = [...otp];
			if (!newOtp[index] && index > 0) {
				inputRefs.current[index - 1]?.focus();
			}
			newOtp[index] = ""; // Kosongkan input saat dihapus
			setOtp(newOtp);
		}
    };

    const submitOtp = useCallback(async () => {
        setIsLoading(true);

        // sesuai backend -> semua digit masuk ke digit-input[]
        const keys = otp.map(() => "digit-input[]");
        const values = otp;

        const sanitizedKeys = addDefaultKeys(keys).filter((key) => key !== "devop-sso");
        const formData = getFormData(
            sanitizedKeys,
            values.filter((v) => v != null && v !== "" && v !== "null")
        );

        try {
            const res = await ApiService.processApiRequest("verify", formData, null, true);
            if (res?.status) {
                localStorage.setItem("regist_token", res.data.data.token);
                alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle("facereg"));
            } else {
                alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle("verify"));
            }
        } finally {
            setIsLoading(false);
        }
    }, [otp, onToggle]);

    const resendOtp = useCallback(async () => {
        setIsLoading(true);
        const formData = getFormData(
            addDefaultKeys(["email"]).filter((key) => key !== "devop-sso"),
            [localStorage.getItem("email"), ...getCombinedValues([])]
                .filter(value => value != null && value !== "" && value !== "null")
        );
        try {
            const res = await ApiService.processApiRequest("sendOTP", formData, null, false);
            if (res?.data) {
                alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location));
                setCountdown(60); // restart countdown setelah resend
            }
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
                            maxLength="1"
                            ref={(el) => (inputRefs.current[index] = el)}
                            value={value}
                            onChange={(e) => handleChange(index, e)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="size-16 bg-white text-black font-semibold text-lg text-center rounded-lg focus:border-black focus:border-3"
                        />
                    ))}
                </div>
                <p className="text-center font-light text-xs my-2">
                    Tidak Menerima Kode OTP?{" "}
                    {countdown > 0 ? (
                        <span className="text-gray-400 font-semibold">
                            Kirim ulang dalam {countdown}s
                        </span>
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
                    className={`btn-submit ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoading ? "Processing..." : "Verification OTP"}
                </button>
            </div>
        </div>
    );
}