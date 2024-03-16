import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { verify } from "../utils/api";
import Swal from "sweetalert2";

export default function OtpInput() {
	const { status } = useParams();
	const [otp, setOtp] = useState(new Array(4).fill(""));
	const inputRefs = useRef([]);
	const formRef = useRef();

	useEffect(() => {
		if (inputRefs.current[0]) {
			inputRefs.current[0].focus();
		}
	}, []);

	const onOtpSubmit = (e) => {
		e.preventDefault();
		let formData = new FormData(formRef.current);
		const csrf = Cookies.get("ci_sso_csrf_cookie");
		formData.append("csrf_token", csrf);

		verify(formData, (res) => {
			if (res.status == 200 && res.data.data) {
				Swal.fire({
					titleText: res.data.data.title,
					text: "Account Activated",
					icon: "success",
					allowOutsideClick: false,
					allowEnterKey: false,
					allowEscapeKey: false,
				}).then(() => window.location.replace("/facecam"));
			} else {
				Swal.fire({
					titleText: res.data.title,
					text: res.data.message,
					icon: "error",
					allowOutsideClick: false,
					allowEnterKey: false,
					allowEscapeKey: false,
				}).then(() => window.location.replace(`/verify/${status}`));
			}
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
				<form onSubmit={onOtpSubmit} ref={formRef}>
					<div className="flex justify-between my-8">
						{otp.map((value, index) => {
							return (
								<input
									key={index}
									type="number"
									name="digit-input[]"
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
						Didn&apos;t receive the verification code?
						<Link className="text-center font-bold">
							{" "}
							Click Here
						</Link>
					</p>
					<button
						type="submit"
						className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-8"
					>
						Verifikasi
					</button>
				</form>
			</div>
		</div>
	);
}
