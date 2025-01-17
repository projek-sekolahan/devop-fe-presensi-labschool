import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { parseJwt } from "../utils/utils";

export default function Profile() {
	const userData = parseJwt(localStorage.getItem("token")); console.log(userData);
	return (
	  <div className="profile-container">
      {/* Header Section */}
      <header>
        <Link to="/home">
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </Link>
        <div className="text-center">
          <h1 className="profile-section-container">Profile</h1>
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
      <main>
        {[
          { label: "Name", value: userData.nama_lengkap },
          { label: "Account Email", value: userData.email },
          { label: "Phone Number", value: userData.phone },
        ].map((item, index) => (
          <div
            key={index}
            className="profile-info"
          >
            <h4>{item.label}</h4>
            <p>{item.value}</p>
          </div>
        ))}
      </main>
    </div>		
	);
}