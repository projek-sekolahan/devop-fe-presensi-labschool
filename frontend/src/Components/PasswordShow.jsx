import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { forwardRef } from "react";

const PasswordShow = forwardRef(function PasswordShow(props, passwordRef) {
	return (
		<label className="password-toggle flex justify-center items-center border-[1px] border-gray-300 bg-white rounded-lg w-10 h-10">
            <input
                type="checkbox"
                className="hidden"
                onChange={() => {
                    passwordRef.current.type === "password"
                        ? (passwordRef.current.type = "text")
                        : (passwordRef.current.type = "password");
                }}
            />
            <FaEye className="password-icon-eye hidden text-gray-500" />
            <FaEyeSlash className="password-icon-eye-slash text-gray-500" />
        </label>
	);
});
export default PasswordShow;
