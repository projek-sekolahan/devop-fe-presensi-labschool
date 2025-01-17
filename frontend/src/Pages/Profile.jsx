import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { parseJwt } from "../utils/utils";

export default function Profile() {
	const userData = parseJwt(localStorage.getItem("token"));
	return (
	  <div className="font-primary flex flex-col h-screen w-full sm:max-w-md sm:mx-auto pt-4 relative text-gray-900 bg-gray-50 px-6 sm:px-8">
      {/* Header Section */}
      <header className="bg-blue-500 rounded-b-2xl p-6 sm:p-8 shadow-lg text-white relative">
        <Link to="/home" className="absolute top-4 left-4 sm:top-6">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-xl sm:text-2xl">Profile</h1>
          <div className="mt-6">
            <img
              src={userData.img_location}
              alt="User Profile"
              className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow-md"
            />
            <p className="font-semibold text-lg mt-4">{userData.nama_lengkap}</p>
          </div>
        </div>
      </header>

      {/* User Info Section */}
      <main className="mt-20 space-y-6">
        {[
          { label: "Name", value: userData.nama_lengkap },
          { label: "Account Email", value: userData.email },
          { label: "Phone Number", value: userData.phone },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-500">{item.label}</h4>
            <p className="text-base font-medium text-gray-800 mt-1">{item.value}</p>
          </div>
        ))}
      </main>
    </div>		
	);
}