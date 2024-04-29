import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { parseJwt } from "../utils/utils";

export default function Profile() {
	userData = parseJwt(localStorage.getItem("token"));

	return (
		<div className="font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-8 relative text-white px-6">
			<div
				id="id"
				className="absolute w-full top-0 left-0 bg-primary-md rounded-b-[3rem] p-6 sm:p-8"
			>
				<Link to="/home">
					<ArrowLeftIcon className="size-7 absolute top-8 left-6" />
				</Link>
				<h2 className="text-center font-bold text-lg">Profil</h2>
				<img
					src={`https://devop-sso.smalabschoolunesa1.sch.id/${userData.img_location}`}
					alt="photo_profile"
					className="size-28 rounded-full bg-white mt-6 mx-auto"
				/>
				<p className="text-center text-base font-semibold mt-3">
					{userData.nama_lengkap}
				</p>
			</div>
			<div id="bio" className="text-bg-3 mt-64 flex flex-col gap-2">
				<div className="pb-4 border-b-[0.5px]">
					<h4 className="text-sm font-medium text-gray-400">Name</h4>
					<p className="w-full text-gray-800">
						{userData.nama_lengkap}
					</p>
				</div>
				<div className="pb-4 border-b-[0.5px]">
					<h4 className="text-sm font-medium text-gray-400 mt-3">
						Account Email
					</h4>
					<p className="w-full text-gray-800">{userData.email}</p>
				</div>
				<div>
					<h4 className="text-sm font-medium text-gray-400 mt-3">
						Phone Number
					</h4>
					<p className="w-full text-gray-800">{userData.phone}</p>
				</div>
			</div>
		</div>
	);
}
