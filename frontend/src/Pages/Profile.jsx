import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { parseJwt } from "../utils/utils";

export default function Profile() {
	const userData = parseJwt(localStorage.getItem("token"));
	return (
<div className="font-primary flex flex-col h-screen w-full sm:max-w-md sm:mx-auto pt-8 relative text-white px-4 sm:px-8">
  {/* Header Profile */}
  <div
    id="id"
    className="absolute w-full top-0 left-0 bg-primary-md rounded-b-3xl p-6 sm:p-8 shadow-lg"
  >
    <Link to="/home" className="absolute top-6 left-6 sm:top-8">
      <ArrowLeftIcon className="w-6 h-6 text-white" />
    </Link>
    <h2 className="text-center font-bold text-lg sm:text-xl">Profil</h2>
    <img
      src={userData.img_location}
      alt="User Profile"
      className="w-28 h-28 rounded-full bg-white mt-8 mx-auto object-cover"
    />
    <p className="text-center text-base font-semibold mt-4 sm:mt-6">
      {userData.nama_lengkap}
    </p>
  </div>

  {/* Bio Section */}
  <div id="bio" className="mt-[15rem] sm:mt-[18rem] flex flex-col gap-6">
    <div className="pb-4 border-b border-gray-300">
      <h4 className="text-sm font-medium text-gray-400">Name</h4>
      <p className="text-base text-gray-800 mt-1">{userData.nama_lengkap}</p>
    </div>
    <div className="pb-4 border-b border-gray-300">
      <h4 className="text-sm font-medium text-gray-400">Account Email</h4>
      <p className="text-base text-gray-800 mt-1">{userData.email}</p>
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-400">Phone Number</h4>
      <p className="text-base text-gray-800 mt-1">{userData.phone}</p>
    </div>
  </div>
</div>		
	);
}