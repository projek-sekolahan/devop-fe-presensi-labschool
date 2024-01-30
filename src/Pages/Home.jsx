"use client";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/solid";
import {
	CheckCircleIcon,
	ClockIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Carousel } from "flowbite-react";
import { Link } from "react-router-dom";
import { HomeIcon, UserIcon } from "@heroicons/react/20/solid";
import SideMenu from "/src/Components/SideMenu";
import { useState, useEffect } from "react";

export default function Home() {
	const [show, setShow] = useState(false);

	window.addEventListener("click", (e) => {
		if (e.pageX > (screen.width * 75) / 100) {
			setShow(false);
		}
	});

	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-8 relative text-white px-6">
			<img
				src="/Icons/elipse.svg"
				alt="elipse"
				className="w-full absolute z-[1] left-0 top-[-30px] "
			/>
			<div id="core" className="relative z-[2] size-full">
				<nav className="flex items-center justify-between">
					<button
						onClick={() => {
							setShow(true);
						}}
					>
						<Bars3Icon className="fill-white size-8" />
					</button>
					<div id="profile" className="flex items-center gap-2">
						<img
							src="https://source.unsplash.com/woman-in-white-shirt-holding-green-plant-6l2SLnzdF-A/600x600"
							alt="photo_profile"
							className="size-12 rounded-full bg-white"
						/>
						<p className="font-semibold text-sm ">
							Fata Nadhira Putri
						</p>
					</div>
					<button>
						<BellIcon className="fill-white size-8" />
					</button>
				</nav>
				<main className="mt-9 h-56 sm:h-52">
					<div id="news" className="size-full">
						<Carousel
							leftControl=" "
							rightControl=" "
							className="drop-shadow-[4px_4px_2px_rgba(0,0,0,0.5)]"
						>
							<img src="/img/news.png" alt="..." />
							<img src="/img/news.png" alt="..." />
							<img src="/img/news.png" alt="..." />
							<img src="/img/news.png" alt="..." />
						</Carousel>
						<div
							id="rekap"
							className="bg-white h-3/5 mt-5 rounded-2xl px-3 py-2"
						>
							<h3 className="text-primary-md font-bold text-base">
								{"Rekapan Presensi (Bulan Ini)"}
							</h3>
							<div className="flex justify-between mt-2">
								<div id="hadir" className="w-24">
									<div className="mx-auto bg-secondary-green size-[50px] rounded-full p-[10px]">
										<p className="text-center text-lg font-bold">
											15
										</p>
									</div>
									<h4 className="text-center text-xs font-bold text-primary-md">
										Hadir
									</h4>
								</div>
								<div id="izin" className="w-24">
									<div className="mx-auto bg-secondary-yellow size-[50px] rounded-full p-[10px]">
										<p className="text-center text-lg font-bold">
											2
										</p>
									</div>
									<h4 className="text-center text-xs font-bold text-primary-md">
										Izin / Sakit
									</h4>
								</div>
								<div id="terlambat" className="w-24">
									<div className="mx-auto bg-secondary-red size-[50px] rounded-full p-[10px]">
										<p className="text-center text-lg font-bold">
											0
										</p>
									</div>
									<h4 className="text-center text-xs font-bold text-primary-md">
										Terlambat
									</h4>
								</div>
							</div>
						</div>
						<Link
							id="presensi"
							to="/presensi"
							className="bg-white w-full h-fit mt-5 rounded-2xl px-3 py-2 flex gap-2 items-center"
						>
							<div className="size-10 bg-primary-md rounded-full flex justify-center items-center">
								<CheckCircleIcon className="size-6" />
							</div>
							<p className="text-primary-md text-center font-bold text-sm">
								Presensi
							</p>
							<ChevronRightIcon className="absolute size-4 stroke-bg-3 right-10" />
						</Link>
						<Link
							id="riwayat_presensi"
							to="/riwayat"
							className="bg-white w-full h-fit mt-5 rounded-2xl px-3 py-2 flex gap-2 items-center"
						>
							<div className="size-10 bg-primary-md rounded-full flex justify-center items-center">
								<ClockIcon className="size-6" />
							</div>
							<p className="text-primary-md text-center font-bold text-sm">
								Riwayat Presensi
							</p>
							<ChevronRightIcon className="absolute size-4 stroke-bg-3 right-10" />
						</Link>
					</div>
				</main>
				<div className="absolute bottom-5 left-0 bg-white w-full h-fit py-2 px-4 rounded-s-full rounded-e-full flex justify-between">
					<Link
						to="/home"
						className="flex flex-col justify-center items-center text-primary-md"
					>
						<HomeIcon className="size-7" />
						<p className="text-center font-bold text-xs">Beranda</p>
					</Link>
					<Link
						to="/profile"
						className="flex flex-col justify-center items-center text-bg-2 hover:text-primary-md"
					>
						<UserIcon className="size-7" />
						<p className="text-center font-bold text-xs">Profile</p>
					</Link>
				</div>
			</div>
			<SideMenu show={show} />
		</div>
	);
}
