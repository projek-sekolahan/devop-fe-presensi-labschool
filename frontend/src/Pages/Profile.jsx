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
      
    </div>
	);
}