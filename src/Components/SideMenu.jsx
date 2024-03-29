import { useEffect, useState } from "react";
import {
	UserCircleIcon,
	Cog6ToothIcon,
	QuestionMarkCircleIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function SideMenu({ show }) {
	return (
		<div
			id="container"
			className={`${
				show ? "translate-x-[100vw]" : "translate-x-0"
			} absolute w-3/4 h-screen bg-white z-10 left-[-100vw] top-0 duration-500 before:size-screen before:bg-gray-500 before:opacity-30 before:blur-xl`}
		>
			<div className="size-full relative px-4">
				<img
					src="/Icons/Ellipse 190.svg"
					alt=""
					className="w-full absolute left-0 top-0"
				/>
				<div className="flex absolute top-0 left-0 justify-between w-full">
					<img src="/Icons/Group 117.svg" alt="" />
					<img src="/Icons/Group 116.svg" alt="" />
					<img src="/Icons/Group 115.svg" alt="" />
				</div>
				<div id="bio" className="absolute top-9 left-4 flex gap-2">
					<img
						src="https://source.unsplash.com/woman-in-white-shirt-holding-green-plant-6l2SLnzdF-A/600x600"
						alt="photo_profile"
						className="size-12 rounded-full bg-white"
					/>
					<div className="font-normal text-base text-bg-2">
						<h4>Halo!</h4>
						<p>Fata Nadhira Putri</p>
					</div>
				</div>
				<div
					id="menu"
					className="absolute top-40 w-[65vw] sm:w-[65%] text-primary-high flex flex-col gap-4"
				>
					<Link
						to="/profile"
						className="w-full bg-bg-2 p-2 rounded-xl flex gap-3 items-center"
					>
						<UserCircleIcon className="size-9" />
						<p>Profil</p>
						<ChevronRightIcon className="size-5 stroke-2 ml-auto" />
					</Link>
					<Link
						to="/setting"
						className="w-full bg-bg-2 p-2 rounded-xl flex gap-3 items-center"
					>
						<Cog6ToothIcon className="size-9" />
						<p>Pengaturan</p>
						<ChevronRightIcon className="size-5 stroke-2 ml-auto" />
					</Link>
					<Link
						to="/bantuan"
						className="w-full bg-bg-2 p-2 rounded-xl flex gap-2 items-center"
					>
						<QuestionMarkCircleIcon className="size-9" />
						<p>Bantuan</p>
						<ChevronRightIcon className="size-5 stroke-2 ml-auto" />
					</Link>
				</div>
				<Link
					to="/login"
					className="btn border-none w-4/5 py-3 px-16 bg-primary-low text-center font-bold rounded-xl absolute bottom-4 left-[10%]"
				>
					Keluar
				</Link>
			</div>
		</div>
	);
}
