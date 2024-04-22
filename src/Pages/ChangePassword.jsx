import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import apiXML from "../utils/apiXML";
import { getFormData, alert } from "../utils/utils";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export default function ChangePassword() {
	const emailRef = useRef();
	const [load, setLoad] = useState(false);
	const submitHandler = (e) => {
		e.preventDefault();
		setLoad(true);
		const key = ["username", "csrf_token"];
		const values = [
			emailRef.current.value,
			Cookies.get("ci_sso_csrf_cookie"),
		];
		apiXML.recover(getFormData(key, values)).then((res) => {
			res = JSON.parse(res);
			setLoad(false);
			res.status
				? alert(res.data.info, res.data.title, res.data.message, () =>
						window.location.replace("verify"),
					)
				: alert(res.info, res.title, res.message, () =>
						window.location.replace("recover"),
					);
		});
	};

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			<Link to="/">
				<ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
			</Link>
			<img
				src="/img/reset_pwd.png"
				alt="reset"
				className="w-screen h-2/3 absolute top-0 left-0 z-0"
			/>
			<div className="w-full h-1/2 mt-auto bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8 relative z-10">
				<h2 className="font-bold text-4xl">Ganti Password</h2>
				<div className="my-6 space-y-4 md:space-y-6">
					<form className="space-y-4 md:space-y-6 flex flex-col gap-2">
						<input
							type="email"
							name="email"
							id="email"
							ref={emailRef}
							className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							placeholder="Email"
							required=""
						/>
						<button
							onClick={submitHandler}
							disabled={load}
							className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
						>
							{load ? (
								<div className="flex justify-center items-center gap-2">
									<p>Loading</p>
									<span className="loading loading-spinner text-white"></span>
								</div>
							) : (
								"Ganti Password"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
