import { Link } from "react-router-dom";
import apiFetch from "../utils/apiFetch.js";
import { getHash, getKey, getFormData, createFormData, parseJwt, alert } from "../utils/utils.js";
import { useEffect, useState, useRef } from "react";
import PasswordShow from "../Components/PasswordShow";
import Cookies from "js-cookie";

export default function Login() {
	localStorage.clear();
	const emailRef = useRef(null);
	const passwordRef = useRef(null);
const onSubmit = async () => {
    const emailValue = emailRef.current.value;
    const passwordValue = passwordRef.current.value;
    const hash = getHash(passwordValue);
    const token_key = getKey(emailValue, hash);
    const csrf_token = Cookies.get("ci_sso_csrf_cookie");
	const key = ["username", "password", "devop-sso", "csrf_token"];
	const value = [emailValue, hash, token_key[1], csrf_token];
	localStorage.setItem("AUTH_KEY", token_key[0]);
	localStorage.setItem("devop-sso", token_key[1]);
	try {
		const loginResponse = await apiFetch.toLogin(localStorage.getItem("AUTH_KEY"), getFormData(key, value));
		console.log(loginResponse);
        if (loginResponse.status === 201) {
            const responseData = await loginResponse.json();
            localStorage.setItem("login_token", responseData.data.Tokenjwt);
            const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token"];
            const values = [
                localStorage.getItem("AUTH_KEY"),
                localStorage.getItem("devop-sso"),
                responseData.csrfHash,
                localStorage.getItem("login_token"),
            ];

            alert(responseData.data.info, responseData.data.title, responseData.data.message, responseData.data.location);

            /* const getUserDataResponse = await fetch(`${api_url}/api/client/users/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${localStorage.getItem("AUTH_KEY")}`,
                },
                body: getFormData(keys, values).toString()
            });

            if (getUserDataResponse.status === 201) {
                const userData = await getUserDataResponse.json();
                localStorage.setItem("token", userData.data.data);
            } else {
                const errorData = await getUserDataResponse.json();
                alert(errorData.data.info, errorData.data.title, errorData.data.message, errorData.data.location);
            } */
        } else {
            const errorData = await loginResponse.json();
            alert(errorData.data.info, errorData.data.title, errorData.data.message, errorData.data.location);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while processing your request.");
    }

	return false;
	try {
		const loginResponse = await axiosInstance.post(`${api_url}/api/client/auth/login`, getFormData(key, value), {
			headers: {
				Authorization: `Basic ${localStorage.getItem("AUTH_KEY")}`,
			},
		});
		if (loginResponse.status === 201) {
			localStorage.setItem("login_token", loginResponse.data.data.Tokenjwt);
			const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token"];
			const values = [
				localStorage.getItem("AUTH_KEY"),
				localStorage.getItem("devop-sso"),
				loginResponse.data.csrfHash,
				localStorage.getItem("login_token"),
			];
			alert(loginResponse.data.data.info, loginResponse.data.data.title, loginResponse.data.data.message, loginResponse.data.data.location);
			const getUserDataResponse = await axiosInstance.post(`${api_url}/api/client/users/profile`, getFormData(keys, values), {
				headers: {
					Authorization: `Basic ${localStorage.getItem("AUTH_KEY")}`,
				},
			});
			if (getUserDataResponse.status === 201) {
				localStorage.setItem("token", getUserDataResponse.data.data);
			} else {
				alert(getUserDataResponse.data.data.info, getUserDataResponse.data.data.title, getUserDataResponse.data.data.message, getUserDataResponse.data.data.location);
			}
		} else {
			alert(loginResponse.data.data.info, loginResponse.data.data.title, loginResponse.data.data.message, loginResponse.data.data.location);
		}
	} catch (error) {
		console.log(error);
	}
}
			

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
							onClick={onSubmit}
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
