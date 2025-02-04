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
      <Layout link="/home" label="Profile Anda">
        <div className="custom-card mt-10">
          <Card className="p-6 text-center">
            <img
              src={userData.img_location}
              alt="User Profile"
              className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow-md"
            />
            <p className="font-semibold text-lg mt-4">{`@${userData.email.split('@')[0]}`}</p>
            <div className="mt-4 space-y-2">
              {[ 
                { label: "Name", value: userData.nama_lengkap, icon: <UserIcon className="w-5 h-5 inline-block mr-2" /> },
                { label: "Account Email", value: userData.email, icon: <EnvelopeIcon className="w-5 h-5 inline-block mr-2" /> },
                { label: "Phone Number", value: userData.phone, icon: <PhoneIcon className="w-5 h-5 inline-block mr-2" /> }
              ].map((item, index) => (
                <div key={index} className="profile-info flex items-center">
                  {item.icon}
                  <div>
                    <h4 className="font-medium">{item.label}</h4>
                    <p className="text-gray-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Layout>
    </div>
	);
}