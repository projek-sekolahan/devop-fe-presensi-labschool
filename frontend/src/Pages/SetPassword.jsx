import { useRef, useState } from "react";
import { getFormData, getHash, alertMessage, loading, addDefaultKeys } from "../utils/utils";
import ApiService from "../utils/ApiService";
import PasswordShow from "../Components/PasswordShow";
import Cookies from "js-cookie";
import { validateFormFields } from "../utils/validation";

export default function SetPassword({ isOpen, onToggle }) {
	const [warning, setWarning] = useState("none");
	const [disabled, setDisabled] = useState(false);
	const [errors, setErrors] = useState({password: ""});
	const inputRef = useRef();
	const confirmRef = useRef();

	const changeHandler = (e) => {
		if (inputRef.current.value.trim()) {
			setWarning("none");
			if (e.target.value == inputRef.current.value.trim()) {
				setDisabled(false);
			} else {
				setDisabled(true);
			}
		} else {
			setWarning("inline");
		}
	};

	const submitHandler = async (e) => {
		e.preventDefault();
		
		// Validate form fields
        const validationErrors = validateFormFields({password: { value: inputRef.current.value.trim(), type: "password" }});

        // Set errors if any
        setErrors({password: validationErrors.password || ""});

        // If there are validation errors, stop form submission
        if (Object.values(validationErrors).some((error) => error)) {
            return;
        }
		
		loading("Loading", "Processing Set Password Data...");
		setDisabled(true);
		const key = ["password"];
		const combinedKeys = addDefaultKeys(key);
		const values = [
			getHash(inputRef.current.value),
			localStorage.getItem("regist_token"),
			Cookies.get("csrf"),
		];
		const res = await ApiService.processApiRequest("setPassword", getFormData(combinedKeys, values));
		setDisabled(false);
		if (res) {
			alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle(res.data.location));
		}
	};

	return (
		<div className="confirmation-container">
			{/* Background Image */}
			<img
				src="/frontend/Icons/splash.svg"
				alt="reset"
				className={`bg-image ${isOpen ? "open" : ""}`}
			/>

			{/* Form Container */}
			<div className={`confirmation-form-container ${isOpen ? "open" : "closed"}`}>
				<h2 className="text-title text-4xl">Set Password</h2>
				<form className="confirmation-form">
					{/* Password Input */}
					<div className="input-group">
						<label
							htmlFor="password"
							className={`input-label ${
								errors.password ? "text-red-700 font-semibold" : ""
							}`}
							>
							{errors.password ? errors.password : "Password"}
                        </label>
						<div className="flex gap-2">
							<input
								type="password"
								name="password"
								id="password"
								placeholder="Password (8 or more characters)"
								className="input-field bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
								required
								ref={inputRef}
							/>
							<PasswordShow ref={inputRef} />
						</div>
						<label
							htmlFor="password"
							style={{ display: `${warning}` }}
							className="warning-text text-red-700 text-sm font-semibold"
						>
							Please fill it first
						</label>
					</div>

					{/* Confirm Password Input */}
					<div className="input-group">
						<label htmlFor="confirm-password" className="input-label">Confirm Password</label>
						<div className="flex gap-2">
							<input
								type="password"
								placeholder="Password (8 or more characters)"
								className="input-field bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
								required
								ref={confirmRef}
								onChange={changeHandler}
							/>
							<PasswordShow ref={confirmRef} />
						</div>
					</div>

					{/* Submit Button */}
					<button
						type="button"
						onClick={submitHandler}
						disabled={disabled}
						className={`btn-submit w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 ${
							disabled ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						{disabled ? (
							<div className="flex justify-center items-center gap-2">
								<p className="text-white">Loading</p>
								<span className="loading loading-spinner text-white"></span>
							</div>
						) : (
							'Confirm Register'
						)}
					</button>
				</form>
			</div>
		</div>
	);
}