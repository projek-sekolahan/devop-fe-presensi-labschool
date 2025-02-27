import { useState, useRef, useEffect, useCallback } from "react";
import ApiService from "../utils/ApiService";
import { getFormData, alertMessage, getCombinedValues, addDefaultKeys } from "../utils/utils";

export default function OtpInput({ isOpen, onToggle }) {
	const [otp, setOtp] = useState(new Array(4).fill(""));
	const [load, setLoad] = useState(false);
	const inputRefs = useRef([]);
	const formRef = useRef();

	useEffect(() => {
		inputRefs.current[0]?.focus();
	}, []);

	const onOtpSubmit = useCallback(async () => {
		setLoad(true);
		const keys = new Array(4).fill("digit-input[]");
		const values = [...otp, ...getCombinedValues([])].filter(Boolean);
		const sanitizedKeys = addDefaultKeys(keys).filter((key) => key !== "devop-sso");
		const formData = getFormData(sanitizedKeys, values);
		
		const res = await ApiService.processApiRequest("verify", formData, null, true);
		setLoad(false);

		if (res?.data) {
			localStorage.setItem("regist_token", res.data.data.token);
			alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle("facereg"));
		}
	}, [otp, onToggle]);

	const handleChange = (index, e) => {
		const value = e.target.value.replace(/\D/g, ""); // Hanya angka yang diperbolehkan
		if (!value) return;

		const newOtp = [...otp];
		newOtp[index] = value.charAt(value.length - 1); // Ambil digit terakhir
		setOtp(newOtp);

		if (index < 3 && inputRefs.current[index + 1]) {
			inputRefs.current[index + 1].focus();
		}
	};

	const handleClick = (index) => {
		inputRefs.current[index]?.focus();
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const sendOtpAgain = useCallback(async () => {
		setLoad(true);
		const keys = ["email"];
		const values = [localStorage.getItem("email"), ...getCombinedValues([])].filter(Boolean);
		const sanitizedKeys = addDefaultKeys(keys).filter((key) => key !== "devop-sso");
		const formData = getFormData(sanitizedKeys, values);
		const res = await ApiService.processApiRequest("sendOTP", formData, null, false);
		setLoad(false);

		if (res?.data) {
			alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location));
		}
	}, [onToggle]);

	return (
		<div className="verification-container">
			{/* Logo Image */}
			<img
				src="/frontend/Icons/splash.svg"
				alt="labschool-unesa-logo"
				className={`bg-image ${isOpen ? "open" : ""}`}
			/>
			{/* Verification Form Container */}
			<div className={`verification-form-container ${isOpen ? "open" : "closed"}`}>
				<h2 className="text-title text-xl">Email Verification</h2>
				<p className="text-sm text-center">Cek Email Anda (Masukkan Kode OTP)</p>
				<form ref={formRef} className="verification-form">
					{/* OTP Input Fields */}
					<div className="flex justify-between my-8">
						{otp.map((value, index) => (
							<input
								key={index}
								name="digit-input[]"
								type="text"
								inputMode="numeric"
								pattern="\d*"
								maxLength="1"
								ref={(el) => (inputRefs.current[index] = el)}
								value={value}
								onChange={(e) => handleChange(index, e)}
								onClick={() => handleClick(index)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className="size-16 bg-white text-black font-semibold text-lg text-center rounded-lg focus:border-black focus:border-3"
							/>
						))}
					</div>
					{/* Resend OTP Text */}
					<p className="text-center font-light text-xs">
						Tidak Menerima Kode OTP?{" "}
						<span
							className="text-link resend-otp text-center font-bold cursor-pointer"
							onClick={sendOtpAgain}
						>
							Klik Disini
						</span>
					</p>
					{/* Submit Button */}
					<button
						type="button"
						onClick={onOtpSubmit}
						disabled={load}
						className={`btn-submit ${load ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						{load ? (
							<div className="flex justify-center items-center gap-2">
								<p className="text-white">Loading</p>
								<span className="loading loading-spinner text-white"></span>
							</div>
						) : (
							"Verifikasi"
						)}
					</button>
				</form>
			</div>
		</div>
	);
}