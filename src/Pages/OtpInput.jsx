import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import apiXML from "../utils/apiXML";
import { getFormData, alert, loading } from "../utils/utils";
import Swal from "sweetalert2";

export default function OtpInput() {
	const [otp, setOtp] = useState(new Array(4).fill(""));
	const [load, setLoad] = useState(false);
	const inputRefs = useRef([]);
	const formRef = useRef();
	const { state } = useLocation();

	useEffect(() => {
		if (inputRefs.current[0]) {
			inputRefs.current[0].focus();
		}
	}, []);

	const onOtpSubmit = () => {
		setLoad(true);
		const keys = [...new Array(4).fill("digit-input[]"), "csrf_token"];
		const values = [...otp, Cookies.get("ci_sso_csrf_cookie")];
		loading("Loading", "Processing OTP Data...");
		apiXML.verify(getFormData(keys, values)).then((res) => {
			res = JSON.parse(res);
			setLoad(false);
			localStorage.setItem("regist_token", res.data.token);
			res.status
				? alert(res.data.info, res.data.title, res.data.message, () =>
						window.location.replace(state),
					)
				: alert(res.info, res.title, res.message, () =>
						window.location.replace(res.location),
					);
		});
	};

	const handleChange = (index, e) => {
		const value = e.target.value;
		if (isNaN(value)) return;

		const newOtp = [...otp];

		newOtp[index] = value.substring(value.length - 1);
		setOtp(newOtp);

		// const combinedOtp = newOtp.join("");

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
	const sendOtpAgain = (e) => {
		const key = ["email", "csrf_token"];
		const values = [
			localStorage.getItem("email"),
			Cookies.get("ci_sso_csrf_cookie"),
		];
		loading("Loading", "Processing Send OTP Data...");
		apiXML.sendOtp(getFormData(key, values)).then((res) => {
			res = JSON.parse(res);
			alert(res.info, res.title, res.message, () =>
				window.location.replace(res.location),
			);
		});
	};

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative">
			<Link to="/">
				<ArrowLeftIcon className="size-7 absolute top-8 left-6" />
			</Link>
			<img
				src="/Icons/splash.svg"
				alt="labschool-unesa-logo"
				className="size-[241px] m-auto mt-24"
			/>
			<div className="w-full h-1/2 mt-auto bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8">
				<h2 className="font-bold text-4xl">Email Verification</h2>
				<p className="text-xs">
					Enter the verification code that was sended to your email
					addreas
				</p>
				<form ref={formRef}>
					<div className="flex justify-between my-8">
						{otp.map((value, index) => {
							return (
								<input
									key={index}
									name="digit-input[]"
									type="number"
									ref={(input) =>
										(inputRefs.current[index] = input)
									}
									value={value}
									onChange={(e) => handleChange(index, e)}
									onClick={() => handleClick(index)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									className="size-16 bg-white text-black font-semibold text-lg text-center rounded-lg focus:border-black focus:border-3"
								/>
							);
						})}
					</div>
					<p className="text-center font-thin text-xs">
						Didn&apos;t receive the verification code?{" "}
						<span
							className="text-center font-bold"
							onClick={sendOtpAgain}
						>
							Click Here
						</span>
					</p>
					<button
						onClick={onOtpSubmit}
						disabled={load}
						className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center disabled:text-white mt-24"
					>
						{load ? (
							<div className="flex justify-center items-center gap-2">
								<p>Loading</p>
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
