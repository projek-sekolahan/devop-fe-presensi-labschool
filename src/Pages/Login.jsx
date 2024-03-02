import { Link } from "react-router-dom";
import { getCsrf } from "../utils/api.js";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

export default function Login() {
	const [csrf, setCsrf] = useState("");
	const emailRef = useRef();
	const passwordRef = useRef();
	const base_url = import.meta.env.VITE_API_URL;

	const data = {
		email: "",
		password: "",
		"devop-sso": "",
		csrf: "",
	};

	// password encrypt
	const getPass = () => {
		const pass = passwordRef.current.value;
		const keycode = CryptoJS.enc.Hex.parse(
			CryptoJS.SHA1(btoa(pass)).toString()
		);
		const authcode = CryptoJS.enc.Hex.parse(CryptoJS.SHA1(pass).toString());
		const hash = CryptoJS.AES.encrypt(pass, keycode, { iv: authcode })
			.toString()
			.replace(/[^\w\s]/gi, "");
		return hash;
	};
	// key
	const getKey = () => {
		const key = btoa(emailRef.current.value + ":" + getPass());
		const tokenkey = CryptoJS.SHA1(key).toString();
		return [key, tokenkey];
	};

	const getFormData = () => {
		data.email = emailRef.current.value;
		data.password = getPass();
		data["devop-sso"] = getKey()[1];
		data.csrf = csrf;

		return Object.keys(data)
			.map(
				(key) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(
						data[key]
					)}`
			)
			.join("&");
	};

	const submitHandler = async () => {
		console.log(getKey(), getFormData());
		const res = await axios.post(
			`${base_url}/api/client/auth/login`,
			{
				headers: {
					Authorization: "Basic " + getKey()[0],
				},
			},
			getFormData()
		);
	};

	useEffect(() => {
		getCsrf().then((result) => setCsrf(result.csrfHash));
	}, []);

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			<img
				src="/img/login.png"
				alt="labschool-unesa-logo"
				className="w-full h-[60vh] absolute top-0 left-0 z-0"
			/>
			<div className="w-full h-fit bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8 absolute z-10">
				<h2 className="font-bold text-4xl">Login</h2>
				<p className="font-light text-xs">
					{"Selamat datang kembali :)"}
				</p>
				<div className="my-6 space-y-4 md:space-y-6">
					<div className="space-y-4 md:space-y-6 flex flex-col gap-2">
						<input
							type="email"
							name="email"
							id="email"
							ref={emailRef}
							className="bg-primary-md border-white border-[1px] placeholder-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black w-full py-3 px-4"
							placeholder="Email"
							required=""
							autoComplete=""
						/>
						<input
							type="password"
							name="password"
							id="password"
							ref={passwordRef}
							placeholder="Password (8 or more characters)"
							className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							required=""
						/>
						<Link
							to="/password/reset"
							className="text-sm font-light text-end"
						>
							Lupa password?
						</Link>

						<button
							onClick={submitHandler}
							className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
						>
							Login
						</button>
					</div>
					<div
						id="line"
						className="w-full border-t-[0.25px] border-white h-0 relative top-4"
					>
						<p className="absolute text-center left-[calc(50%-1.25rem)] top-[-0.85rem] z-10 text-white bg-primary-md w-10">
							or
						</p>
					</div>
				</div>
				<p className="text-center text-sm font-light text-white dark:text-gray-400 mt-10">
					Belum memiliki akun?{" "}
					<Link
						to="/"
						className="font-medium underline text-white hover:underline dark:text-primary-500"
					>
						Register
					</Link>
				</p>
			</div>
		</div>
	);
}
