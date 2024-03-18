import {
	ArrowLeftIcon,
	PencilSquareIcon,
	CheckIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { parseJwt } from "../utils/utils";

export default function Profile() {
	const userData = parseJwt(localStorage.getItem("token"));

	return (
		<div className="font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-8 relative text-white px-6">
			<div
				id="id"
				className="absolute w-full top-0 left-0 bg-primary-md rounded-b-[3rem] p-6 sm:p-8"
			>
				<Link to="/home">
					<ArrowLeftIcon className="size-7 absolute top-8 left-6" />
				</Link>
				<h2 className="text-center font-bold text-lg">Profil</h2>
				<img
					src="https://source.unsplash.com/woman-in-white-shirt-holding-green-plant-6l2SLnzdF-A/600x600"
					alt="photo_profile"
					className="size-28 rounded-full bg-white mt-6 mx-auto"
				/>
				<p className="text-center text-base font-semibold mt-3">
					{userData.nama_lengkap}
				</p>
			</div>
			<div id="bio" className="text-bg-3 mt-64 flex flex-col gap-4">
				<form>
					<label
						htmlFor="name"
						className="text-base font-medium text-black"
					>
						Name
					</label>
					<input
						className="w-full flex border-[1px] border-bg-3 p-3 text-gray-300 items-center rounded-2xl mt-2"
						id="name"
						name="name"
						type="text"
						defaultValue={userData.nama_lengkap}
						required
						disabled={+true}
					/>

					<label
						htmlFor="email"
						className="text-base font-medium text-black mt-4"
					>
						Account Email
					</label>
					<input
						className="w-full flex border-[1px] border-bg-3 p-3 text-gray-300 items-center rounded-2xl mt-2"
						id="email"
						name="email"
						type="text"
						defaultValue={userData.email}
						required
						disabled={+true}
					/>

					<label
						htmlFor="number"
						className="text-base font-medium text-black mt-4"
					>
						Phone Number
					</label>
					<input
						className="w-full flex border-[1px] border-bg-3 p-3 text-gray-300 items-center rounded-2xl mt-2"
						id="number"
						name="number"
						type="text"
						defaultValue={userData.phone}
						required
						disabled={+true}
					/>
				</form>
			</div>
		</div>
	);
}
