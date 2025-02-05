import { Card } from "flowbite-react";
import { FaSquareWhatsapp, FaUserCheck, FaEnvelopeCircleCheck } from "react-icons/fa6";
import Layout from "../Components/Layout";

export default function Profile({ showProfile, userData, closeProfile }) {
	return (
<div
  id="container"
  className={`${
    showProfile ? "translate-x-0" : "translate-x-[100vw]"
  } w-screen h-screen absolute bg-transparent z-10 left-0 top-0 duration-500 overflow-hidden`}
>
  <div className="w-full h-full flex justify-center bg-gray-200">
      <Layout link={closeProfile} label="Profile Anda">
        <div className="custom-card">
          <Card className="shadow-lg rounded-2xl !gap-4 !p-6">
            <img
              src={userData.img_location}
              alt="User Profile"
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-orange-500 shadow-md"
            />
            <p className="font-bold text-center text-xl text-gray-800">{`@${userData.email.split('@')[0]}`}</p>
            <div className="mt-2 space-y-4">
              {[ 
                { label: "Name", value: userData.nama_lengkap, icon: <FaUserCheck className="profile-info-icon" /> },
                { label: "Account Email", value: userData.email, icon: <FaEnvelopeCircleCheck className="profile-info-icon" /> },
                { label: "Phone Number", value: userData.phone, icon: <FaSquareWhatsapp className="profile-info-icon" /> }
              ].map((item, index) => (
                <div key={index} className="profile-info flex gap-4 p-4 border rounded-lg bg-gray-50 hover:shadow-md">
                  {item.icon}
                  <div className="profile-info-content text-left">
                    <h4 className="profile-info-label text-lg font-medium text-gray-700">{item.label}</h4>
                    <p className="profile-info-value text-base text-gray-600">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Layout>
  </div>
</div>
	);
}