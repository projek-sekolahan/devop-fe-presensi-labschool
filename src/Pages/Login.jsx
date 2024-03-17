import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toLogin } from "../utils/api.js";
import { getHash, getKey, getFormData, parseJwt } from "../utils/utils.js";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export default function Login() {
	parseJwt(
		"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjoiUkZWcE1UbHFialJZVkZJMFVEZFpiemRXWTBvMFNFUjNOM2huVEc1M016TlNZMDlQVUZkbWFqbFplVlJwTURReVEwNU5hbVJoVEZsU2RYUjFhMUEzVDNsTmFFeDFOWE16UlVWSmFXOVFXRkpLUVRCUk1qaFpkaTlHU21WNVlXMUhhVEZ5WTBGbkwweDNlbFp5Tnk5WFJraGxhR3hVUVcxRlJVWTFNMFp1T1drM1FrNXdkVEpVS3pablRtSXhLMlZSUjBOMlFWRldaV1Z4WmtOeGFFNVNLMEV4VFU5eWJHZFFkV3BOVWtWWWFWbFhPRkJEWld4alYwUjVSV1ExUjFodFdtSnBLMDFPWkc5cldtd3JVM05RUTJOaVFqQnljRzVrYzBKUlJFNHhhbGxsZWpSTVVWTTRjUzlRVUVKVFYxcEVUM0UxYmtsNE1YaE1VM1pVYldoSWNXWjFSMnh1VFRoeVRWTnZlRU5aZGtKQloxSlZaak51ZGtGM1VtZFFlakJ6ZVVWV1pIaEpkREJrYVNzM1pFMUpUV1ZoY1VsQk9UaFpWRkpxVkVSbFdqbHJTVTVHVnpSd1l6ZFpOamxVTW01d1ZVUmFhRGRZYWsweU1rcHJRazluWm1wdE5XeExVbGQxWkZwRE1FOUpSWFJtVFROMGVrWTRSa2wwT0hCSllXSkVVemx1THpGVFJGRTBRMWhOTUdsSFIzVnhLMHMwZVZOdlNYTnlVbmxpYUVWaVEzbHpORWhsZWk5V2VqaDJka2xzV2toR0swMXVOazlUVG1Vdk9YUldNbVJoZERkdk1uQXZNM3BTWjNSMVVFRnhaMVpMUm5CcWVYaFZPV2RITkhWa1IzTkNSbUpLZUZWQ1RGRndOSFlyYzJ3elNFMXJVREp5VTNOMWJ6UnZiMWhZU0RFNVZsbFdUR1l6UkV0WE1IaG5WV2h4VW1KRlJXWm9SR0YxVEZwdWMzUnVOMFkyVmpGTFVUUlZVRFkzYVRoSmJ5OVJXRTFuZGpaV1ptMXFNa2d3YjNKRk4zQmFNellyUTFneWNYWXlRVXRxZVVOS01reHVNRFU0U3pCQk1HODJlalpsVkd0TGFubFBjRm95ZERCNlIxWlJOSFpaUmpGYWMzSjNTMUp4YVZwa09Yb3lTMFZpZDI5NVRGSmxRbXBHZEdrMlRuYzlQUT09In0.UTZYTzVeCYQZ5e8G0OWCdBT-aJqmBI1pVugehhQTNc8"
	);

	const emailRef = useRef(null);
	const passwordRef = useRef(null);
	const submitHandler = () => {
		const keys = ["username", "password", "devop-sso", "csrf_token"];
		const hash = getHash(passwordRef.current.value);
		const token_key = getKey(emailRef.current.value, hash)[1];
		const csrf_token = Cookies.get("ci_sso_csrf_cookie");
		const values = [emailRef.current.value, hash, token_key, csrf_token];
		toLogin(
			getKey(emailRef.current.value, hash)[0],
			getFormData(keys, values),
			(res) => {
				if (res.status == 201) {
					localStorage.setItem("jwt_token", res.data.data.Tokenjwt);
					Swal.fire({
						titleText: res.data.data.title,
						text: res.data.data.message,
						icon: "success",
						allowOutsideClick: false,
						allowEnterKey: false,
						allowEscapeKey: false,
					}).then(() => window.location.replace(`/home`));
				} else if (res.status == 200) {
					Swal.fire({
						titleText: res.data.title,
						text: res.data.message,
						icon: "error",
						allowOutsideClick: false,
						allowEnterKey: false,
						allowEscapeKey: false,
					}).then(() => window.location.replace(`/login`));
				} else {
					Swal.fire({
						titleText: "Error",
						text: "Silahkan Login Ulang",
						icon: "error",
						allowOutsideClick: false,
						allowEnterKey: false,
						allowEscapeKey: false,
					}).then(() => window.location.replace(`/login`));
				}
			}
		);
	};

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
						<div className="flex gap-2">
							<input
								type="password"
								name="password"
								id="password"
								ref={passwordRef}
								placeholder="Password (8 or more characters)"
								className="flex-1 bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
								required=""
							/>
							<label className="swap flex justify-center items-center border-[1px] border-white relative z-[5] w-10 rounded-lg">
								<input
									type="checkbox"
									className="invisible absolute"
									onChange={() => {
										passwordRef.current.type == "password"
											? (passwordRef.current.type =
													"text")
											: (passwordRef.current.type =
													"password");
									}}
								/>
								<EyeIcon className="size-6 stroke-2 swap-off absolute" />
								<EyeSlashIcon className="size-6 stroke-2 swap-on absolute" />
							</label>
						</div>

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
