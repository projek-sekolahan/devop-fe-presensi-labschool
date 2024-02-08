import { PiUserFocusThin } from "react-icons/pi";
import {ArrowLeftIcon} from "@heroicons/react/24/outline"
import {Link} from "react-router-dom"

export default function FaceVerification(){
    return(
        <div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			<Link to="/presensi">
				<ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
			</Link>
        </div>
    )
}