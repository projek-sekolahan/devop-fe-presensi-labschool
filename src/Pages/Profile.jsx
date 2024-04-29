import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { parseJwt, getFormData } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Loading from "./Loading";

export default function Profile() {
	const [userData, setUserData] = null;

	const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token"];
	const values = [
		localStorage.getItem("AUTH_KEY"),
		localStorage.getItem("devop-sso"),
		localStorage.getItem("csrf"),
		localStorage.getItem("login_token"),
	];

	apiXML
		.getUserData(
			localStorage.getItem("AUTH_KEY"),
			getFormData(keys, values),
		)
		.then((getUserDataResponse) => {
			const res = JSON.parse(getUserDataResponse);
			localStorage.setItem("token", res.data);
			localStorage.setItem("csrf", res.csrfHash);
			setUserData(parseJwt(localStorage.getItem("token")));
		})
		.catch((errorData) => {
			if (errorData.status == 403) {
				localStorage.clear();
				alert(
					"error",
					"Credential Expired",
					"Your credentials has expired. Please login again.",
					() => window.location.replace("/login"),
				);
			} else {
				errorData = JSON.parse(errorData.responseText);
				alert(
					errorData.data.info,
					errorData.data.title,
					errorData.data.message,
					() => window.location.replace(errorData.data.location),
				);
			}
		});

	return !userData ? (
		<Loading />
	) : (
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
					src={`https://devop-sso.smalabschoolunesa1.sch.id/${userData.img_location}`}
					alt="photo_profile"
					className="size-28 rounded-full bg-white mt-6 mx-auto"
				/>
				<p className="text-center text-base font-semibold mt-3">
					{userData.nama_lengkap}
				</p>
			</div>
			<div id="bio" className="text-bg-3 mt-64 flex flex-col gap-2">
				<div className="pb-4 border-b-[0.5px]">
					<h4 className="text-sm font-medium text-gray-400">Name</h4>
					<p className="w-full text-gray-800">
						{userData.nama_lengkap}
					</p>
				</div>
				<div className="pb-4 border-b-[0.5px]">
					<h4 className="text-sm font-medium text-gray-400 mt-3">
						Account Email
					</h4>
					<p className="w-full text-gray-800">{userData.email}</p>
				</div>
				<div>
					<h4 className="text-sm font-medium text-gray-400 mt-3">
						Phone Number
					</h4>
					<p className="w-full text-gray-800">{userData.phone}</p>
				</div>
			</div>
		</div>
	);
}
