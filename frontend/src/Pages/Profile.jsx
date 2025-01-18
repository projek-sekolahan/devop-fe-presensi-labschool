import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
export default function Profile({ showProfile, userData, closeProfile }) {
  useEffect(() => {
    if (!userData) {
      console.log("User data not available, skipping render.");
      return () => {
        console.log("Profile component unmounted.");
      };
    }
    console.log("Profile component mounted or updated.", userData);
  }, []);
	return (
    <div
			id="container"
			className={`${
        showProfile ? "translate-x-[100vw]" : "translate-x-0"
      } w-screen h-screen absolute bg-transparent z-10 left-0 top-0 duration-500`}
		>
      <div className="profile-container">
        {/* Header Section */}
        <header>
          <button onClick={closeProfile}>
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
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
    </div>
	);
}