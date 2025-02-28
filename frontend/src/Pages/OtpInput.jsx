import { useState, useRef, useEffect, useCallback } from "react";
import ApiService from "../utils/ApiService";
import { getFormData, alertMessage, getCombinedValues, addDefaultKeys } from "../utils/utils";

export default function OtpInput({ isOpen, onToggle }) {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

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
        const keys = new Array(4).fill("digit-input[]");
        const values = [...otp, ...getCombinedValues([])].filter(value => value !== "null" && Boolean(value));
        const sanitizedKeys = addDefaultKeys(keys).filter((key) => key !== "devop-sso");
        const formData = getFormData(sanitizedKeys, values);
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
        const formData = getFormData(addDefaultKeys(["email"]).filter((key) => key !== "devop-sso"), [localStorage.getItem("email"), ...getCombinedValues([])].filter(value => value !== "null" && Boolean(value)));
		console.log("keys" , addDefaultKeys(["email"]).filter((key) => key !== "devop-sso"));
		console.log("values" , [localStorage.getItem("email"), ...getCombinedValues([])].filter(value => value !== "null" && Boolean(value)));
		try {
            const res = await ApiService.processApiRequest("sendOTP", formData, null, false);
            if (res?.data) {
                alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location));
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
                    Tidak Menerima Kode OTP? {" "}
                    <span className="text-link resend-otp font-bold cursor-pointer" onClick={resendOtp}>
                        Klik Disini
                    </span>
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