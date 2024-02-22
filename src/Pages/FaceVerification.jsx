import { PiUserFocusThin } from "react-icons/pi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function FaceVerification() {
	const click = () => {
		navigator.geolocation.getCurrentPosition((position) => {
			const latitude = position.coords.latitude;
			const longitude = position.coords.longitude;

			alert(`${latitude} ${longitude}`);
		});
	};

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			<Link to="/presensi">
				<ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
			</Link>
			<div className="mt-[35%] flex flex-col items-center gap-12">
				<div className="size-fit relative flex justify-center items-center after:size-56 after:bg-[rgba(255,255,255,0.7)] after:rounded-full after:absolute after:z-[4] after:blur-sm before:size-56 before:bg-primary-high before:rounded-full before:absolute before:z-[3] before:bottom-3 before:left-6 before:blur-[2px]">
					<PiUserFocusThin className="size-48 z-[5]" />
				</div>
				<div className="flex flex-col text-center px-12">
					<h4 className="font-bold text-3xl mb-2">Verifikasi</h4>
					<p>
						Wajah anda akan diverifikasi untuk memenuhi syarat
						presensi
					</p>
				</div>
				{/* <Link to="/facecam" className="w-full px-6 absolute bottom-16"> */}
				<button
					onClick={click}
					className="btn border-none w-full text-primary-md font-semibold bg-white rounded-xl text-sm px-4 py-2 text-center"
				>
					Verifikasi
				</button>
				{/* </Link> */}
			</div>
		</div>
	);
}
