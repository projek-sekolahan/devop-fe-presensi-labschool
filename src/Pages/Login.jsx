import { Link } from "react-router-dom";
// import { toLogin, getUserData } from "../utils/api.js";
import apiServices from "../utils/apiServices.js";
import { getHash, getKey, getFormData, parseJwt } from "../utils/utils.js";
import { useEffect, useState, useRef } from "react";
import PasswordShow from "../Components/PasswordShow";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export default function Login() {
	localStorage.clear();
	const emailRef = useRef(null);
	const passwordRef = useRef(null);
	const submitHandler = () => {
		const keys = ["username", "password", "devop-sso", "csrf_token"];
		const hash = getHash(passwordRef.current.value);
		const token_key = getKey(emailRef.current.value, hash);
		const csrf_token = Cookies.get("ci_sso_csrf_cookie");
		const values = [emailRef.current.value, hash, token_key[1], csrf_token];

		localStorage.setItem("AUTH_KEY", token_key[0]);
		localStorage.setItem("devop-sso", token_key[1]);
		
		apiServices
			.toLogin(token_key[0], getFormData(keys, values))
			.then((response) => {
				console.log(parseJwt(response.data.data.Tokenjwt, "fromToken"));
				localStorage.setItem("login_token", response.data.data.Tokenjwt);
				const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token"];
				const values = [
					localStorage.getItem("AUTH_KEY"),
					localStorage.getItem("devop-sso"),
					response.data.csrfHash,
					parseJwt(response.data.data.Tokenjwt, "fromToken"),
					// localStorage.getItem("login_token"),
				];
				apiServices
					.getUserData(localStorage.getItem("AUTH_KEY"), getFormData(keys, values))
					.then((res) => {
						console.log(res);
					}).catch((err) => {
						console.log(err);
					});
			})
			.catch((error) => {
				console.log(error);
			});
		/* toLogin(token_key[0], getFormData(keys, values), (res) => {
			if (res.status == 201) {
				localStorage.setItem("login_token", res.data.data.Tokenjwt);

				const key = ["AUTH_KEY", "devop-sso", "csrf_token", "token"];
				const values = [
					getKey(emailRef.current.value, hash)[0],
					getKey(emailRef.current.value, hash)[1],
					res.data.csrfHash,
					res.data.data.Tokenjwt,
				];

				getUserData(
					getKey(emailRef.current.value, hash)[0],
					getFormData(key, values),
					(res) => {
						localStorage.setItem("token", res.data.data);
					}
				);
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
		}); */
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
							<PasswordShow ref={passwordRef} />
						</div>

						<Link
							to="/recover"
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
