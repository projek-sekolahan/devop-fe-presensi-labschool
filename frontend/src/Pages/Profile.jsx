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
        showProfile ? "translate-x-0" : "translate-x-[100vw]"
      } w-screen h-screen absolute bg-transparent z-10 left-0 top-0 duration-500`}
		>
      <div className="relative w-full h-full">
				<div className="size-full">
					<div id="bio">
            
          </div>
        </div>
      </div>
    </div>
	);
}