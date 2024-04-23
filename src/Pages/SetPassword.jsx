import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getFormData, getHash, alert, loading } from "../utils/utils";
import apiXML from "../utils/apiXML";
import PasswordShow from "../Components/PasswordShow";

export default function SetPassword() {
	const [warning, setWarning] = useState("none");
	const [disabled, setDisabled] = useState(true);
	const [setLoading] = useState(false);
	const inputRef = useRef();
	const confirmRef = useRef();

	const changeHandler = (e) => {
		if (inputRef.current.value) {
			setWarning("none");
			if (e.target.value == inputRef.current.value) {
				setDisabled(false);
			} else {
				setDisabled(true);
			}
		} else {
			setWarning("inline");
		}
	};

	const submitHandler = (e) => {
		e.preventDefault();
		setDisabled(true);
		setLoading(true);
		const key = ["password", "devop-sso", "csrf_token"];
		const values = [
			getHash(inputRef.current.value),
			localStorage.getItem("regist_token"),
			localStorage.getItem("csrf"),
		];
		loading("Loading", "Processing Set Password Data...");
		apiXML.setPassword(getFormData(key, values)).then((res) => {
			setLoading(false);
			setDisabled(false);
			res = JSON.parse(res);
			localStorage.setItem("csrf", res.csrfHash);
			res.status
				? alert(res.data.info, res.data.title, res.data.message, () =>
						window.location.replace("login"),
					)
				: alert(res.info, res.title, res.message, () =>
						window.location.replace("setpassword"),
					);
		});
	};

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)]">
			<Link to="/">
				<ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
			</Link>
			<img
				src="/img/reset_pwd.png"
				alt="reset"
				className="h-[57.5%] w-full absolute top-0 left-0"
			/>
			<div className="w-full h-fit mt-auto bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8 relative z-10">
				<h2 className="font-bold text-4xl">Set Password</h2>
				<div className="my-6 space-y-4 md:space-y-6">
					<form className="space-y-4 md:space-y-6 flex flex-col gap-2">
						<div>
							<label htmlFor="password">Password</label>
							<input
								type="password"
								name="password"
								id="password"
								placeholder="Password (8 or more characters)"
								className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
								required=""
								ref={inputRef}
							/>
							<PasswordShow ref={inputRef} />
							<label
								htmlFor="password"
								style={{ display: `${warning}` }}
								className="text-red-700 text-sm font-semibold"
							>
								Please fill it first
							</label>
						</div>
						<div>
							<label htmlFor="confirm-password">
								Confirm Password
							</label>
							<input
								type="password"
								placeholder="Password (8 or more characters)"
								className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
								required=""
								ref={confirmRef}
								onChange={changeHandler}
							/>
							<PasswordShow ref={confirmRef} />
						</div>

						<button
							onClick={submitHandler}
							disabled={disabled}
							className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center disabled:text-white"
						>
							{setLoading ? (
								<div className="flex justify-center items-center gap-2">
									<p>Loading </p>
									<span className="loading loading-spinner text-white"></span>
								</div>
							) : (
								"Set Password"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
