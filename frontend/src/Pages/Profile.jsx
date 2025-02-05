import { Card } from "flowbite-react";
import { MdOutlinePhoneAndroid, MdVerifiedUser, MdEmail } from "react-icons/md";
import Layout from "../Components/Layout";

export default function Profile({ showProfile, userData, closeProfile }) {
	return (
<div
  id="container"
  className={`${
    showProfile ? "translate-x-0" : "translate-x-[100vw]"
  } w-screen h-screen absolute bg-transparent z-10 left-0 top-0 duration-500`}
>
  <div className="w-full h-full flex justify-center items-center bg-gray-50">
    <div className="size-full max-w-md w-full">
      <Layout link={closeProfile} label="Profile Anda">
        <div className="custom-card">
          <Card className="p-6 text-center shadow-lg rounded-2xl bg-white">
            <img
              src={userData.img_location}
              alt="User Profile"
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-orange-500 shadow-md"
            />
            <p className="font-bold text-xl mt-4 text-gray-800">{`@${userData.email.split('@')[0]}`}</p>
            <div className="mt-6 space-y-4">
              {[ 
                { label: "Name", value: userData.nama_lengkap, icon: <MdVerifiedUser className="profile-info-icon" /> },
                { label: "Account Email", value: userData.email, icon: <MdEmail className="profile-info-icon" /> },
                { label: "Phone Number", value: userData.phone, icon: <MdOutlinePhoneAndroid className="profile-info-icon" /> }
              ].map((item, index) => (
                <div key={index} className="profile-info flex items-center gap-4 p-4 border rounded-lg bg-gray-50 hover:shadow-md">
                  {item.icon}
                  <div className="profile-info-content">
                    <h4 className="profile-info-label text-lg font-medium text-gray-700">{item.label}</h4>
                    <p className="profile-info-value text-base text-gray-600">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600">Edit Profile</button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-300">Logout</button>
            </div>
          </Card>
        </div>
      </Layout>
    </div>
  </div>
</div>
	);
}