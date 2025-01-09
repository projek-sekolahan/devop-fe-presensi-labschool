import { Link, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import apiXML from "../utils/apiXML";
import {
	getFormData,
	alertMessage,
	loading,
	handleSessionError,
} from "../utils/utils";
import Cookies from "js-cookie";

export default function OtpInput() {
	const [otp, setOtp] = useState(new Array(4).fill(""));
	const [load, setLoad] = useState(false);
	const inputRefs = useRef([]);
	const formRef = useRef();

	useEffect(() => {
		if (inputRefs.current[0]) {
			inputRefs.current[0].focus();
		}
	}, []);

	const onOtpSubmit = () => {
		setLoad(true);
		const keys = [...new Array(4).fill("digit-input[]"), "csrf_token"];
		const values = [...otp, Cookies.get("csrf")];
		loading("Loading", "Processing OTP Data...");
		apiXML
			.postInput("verify", getFormData(keys, values))
			.then((res) => {
				res = JSON.parse(res); console.log(res.data.data.token);
				setLoad(false);
				localStorage.setItem("regist_token", res.data.data.token);
				Cookies.set("csrf", res.csrfHash);
				res.data.info == "error"
					? alertMessage(
							res.data.title,
							res.data.message,
							res.data.info,
						)
					: alertMessage(
							res.data.title,
							res.data.message,
							res.data.info,
							() => window.location.replace("/facereg"),
						);
			})
			.catch((err) => {
				handleSessionError(err, "/verify");
			});
	};

	const handleChange = (index, e) => {
		const value = e.target.value;
		if (isNaN(value)) return;

		const newOtp = [...otp];

		newOtp[index] = value.substring(value.length - 1);
		setOtp(newOtp);

		if (value && index < 3 && inputRefs.current[index + 1]) {
			inputRefs.current[index + 1].focus();
		}
	};
	const handleClick = (index) => {
		inputRefs.current[index].setSelectionRange(1, 1);

		for (let i = 0; i < 4; i++) {
			if (inputRefs.current[i].value === "") {
				inputRefs.current[i].focus();
				break;
			}
		}
	};
	const handleKeyDown = (index, e) => {
		if (
			e.key === "Backspace" &&
			!otp[index] &&
			index > 0 &&
			inputRefs.current[index - 1]
		) {
			inputRefs.current[index - 1].focus();
		}
	};
	const sendOtpAgain = () => {
		const key = ["email", "csrf_token"];
		const values = [localStorage.getItem("email"), Cookies.get("csrf")];
		loading("Loading", "Processing Send OTP Data...");
		apiXML
			.postInput("sendOTP", getFormData(key, values))
			.then((res) => {
				res = JSON.parse(res);
				Cookies.set("csrf", res.csrfHash);
				alertMessage(
					res.data.info,
					res.data.title,
					res.data.message,
					() => window.location.replace("/" + res.data.location),
				);
			})
			.catch((err) => {
				handleSessionError(err, "/verify");
			});
	};

	return (
		<div className="verification-container flex flex-col min-h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			{/* Logo Image */}
			<img
				src="/frontend/Icons/splash.svg"
				alt="labschool-unesa-logo"
				className="logo-image size-[241px] m-auto mt-24"
			/>

			{/* Verification Form Container */}
			<div className="verification-form-container shadow-md">
				<h2 className="text-title text-center">Email Verification</h2>
				<p className="text-sm text-center">
				Cek Email Anda (Masukkan Kode OTP)
				</p>
				<form ref={formRef} className="verification-form">
					{/* OTP Input Fields */}
					<div className="flex justify-between my-8">
						{otp.map((value, index) => (
							<input
								key={index}
								name="digit-input[]"
								type="number"
								ref={(input) => (inputRefs.current[index] = input)}
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
						Tidak Menerima Kode OTP?{' '}
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
						className={`btn-submit w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 mt-24 ${
							load ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						{load ? (
							<div className="flex justify-center items-center gap-2">
								<p className="text-white">Loading</p>
								<span className="loading loading-spinner text-white"></span>
							</div>
						) : (
							'Verifikasi'
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
