import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
          {/* Header Section */}
          
        </div>
      </div>
    </div>
	);
}