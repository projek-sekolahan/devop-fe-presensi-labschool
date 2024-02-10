import { PiUserFocusThin } from "react-icons/pi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function FaceVerification() {
	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			<Link to="/presensi">
				<ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
			</Link>
			<div className="top-40 mx-auto">
				<div className="size-fit  relative flex justify-center items-center after:size-56 after:bg-[rgba(255,255,255,0.5)] after:rounded-full after:absolute after:z-[4] after:blur-sm before:size-56 before:bg-primary-high before:rounded-full before:absolute before:z-[3] before:bottom-3 before:left-6">
					<PiUserFocusThin className="size-48 z-[5]" />
				</div>
			</div>
		</div>
	);
}
