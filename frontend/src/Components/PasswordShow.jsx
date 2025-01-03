import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { forwardRef } from "react";

const PasswordShow = forwardRef(function PasswordShow(props, ref) {
	return (
		<label className="swap flex justify-center items-center border-[1px] border-white relative z-[5] w-10 rounded-lg">
			<input
				type="checkbox"
				className="invisible absolute"
				onChange={() => {
					ref.current.type == "password"
						? (ref.current.type = "text")
						: (ref.current.type = "password");
				}}
			/>
			<FaEye className="size-6 stroke-2 swap-off absolute" />
			<FaEyeSlash className="size-6 stroke-2 swap-on absolute" />
		</label>
	);
});
export default PasswordShow;
