import { Card } from "flowbite-react";
import { UserIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Layout from "../Components/Layout";

export default function Profile({ showProfile, userData, closeProfile }) {
	return (
    <div
			id="container"
			className={`${
        showProfile ? "translate-x-0" : "translate-x-[100vw]"
      } w-screen h-screen absolute bg-transparent z-10 left-0 top-0 duration-500`}
		>
    <div className="w-full h-full">
				<div className="size-full">
          <Layout link={closeProfile} label="Profile Anda">
            <div className="custom-card">
              <Card className="p-6 text-center">
                <img
                  src={userData.img_location}
                  alt="User Profile"
                  className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow-md"
                />
                <p className="font-semibold text-lg">{`@${userData.email.split('@')[0]}`}</p>
                <div className="mt-2">
                  {[ 
                    { label: "Name", value: userData.nama_lengkap, icon: <UserIcon className="profile-info-icon" /> },
                    { label: "Account Email", value: userData.email, icon: <EnvelopeIcon className="profile-info-icon" /> },
                    { label: "Phone Number", value: userData.phone, icon: <PhoneIcon className="profile-info-icon" /> }
                  ].map((item, index) => (
                    <div key={index} className="profile-info">
                      {item.icon}
                      <div className="profile-info-content">
                        <h4 className="profile-info-label">{item.label}</h4>
                        <p className="profile-info-value">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Layout>
        </div>
      </div>
    </div>
	);
}