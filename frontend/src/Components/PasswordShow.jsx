import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { forwardRef, useState } from "react";

const PasswordShow = forwardRef(function PasswordShow(_, passwordRef) {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => {
        if (passwordRef.current) {
            passwordRef.current.type = isVisible ? "password" : "text";
            setIsVisible(!isVisible);
        }
    };

    return (
        <button
            type="button"
            onClick={toggleVisibility}
            className="flex justify-center items-center border border-gray-300 bg-white rounded-lg w-8 h-12"
        >
            {isVisible ? (
                <FaEyeSlash className="text-gray-500" />
            ) : (
                <FaEye className="text-gray-500" />
            )}
        </button>
    );
});

export default PasswordShow;