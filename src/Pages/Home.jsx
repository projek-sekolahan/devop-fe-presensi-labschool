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
import { useState } from "react";
import { parseJwt, getFormData } from "../utils/utils";
import { sessTime } from "../utils/api";
import Cookies from "js-cookie";

export default function Home() {
	const [show, setShow] = useState(false);
	let userData = {};
	if (localStorage.getItem("token")) {
		userData = parseJwt(localStorage.getItem("token"));
		localStorage.setItem("group_id", userData.group_id);
		console.log(userData);
	} else {
		window.location.replace("/login");
	}

	const checkSession = () => {
		if (!localStorage.getItem("csrf")) {
			localStorage.setItem("csrf", Cookies.get("ci_sso_csrf_cookie"));
		}
		const key = ["devop-sso", "AUTH_KEY", "csrf_token"];
		const values = [
			localStorage.getItem("devop-sso"),
			localStorage.getItem("AUTH_KEY"),
		];
		values[2] = localStorage.getItem("csrf");
		// sessTime(
		// 	localStorage.getItem("AUTH_KEY"),
		// 	getFormData(key, values),
		// 	(res) => {
		// 		console.log(res);
		// 		if (res.data.data.title == "Your Session OK") {
		// 			localStorage.setItem("csrf", res.data.csrfHash);
		// 		} else {
		// window.location.replace("/login");
		// 		}
		// 	}
		// );
	};

	checkSession();
	setInterval(checkSession(), 1200000);

	window.addEventListener("click", (e) => {
		if (e.pageX > (screen.width * 75) / 100) {
			setShow(false);
		}
	});

	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-6 text-white px-6 relative overflow-hidden">
			<img
				src="/Icons/elipse.svg"
				alt="elipse"
				className="w-full min-h-fit absolute z-[1] left-0 top-[-30px] "
			/>
			<nav className="relative z-[2] flex items-center justify-between">
				<button
					onClick={() => {
						setShow(true);
					}}
				>
					<Bars3Icon className="fill-white size-8" />
				</button>
				<div id="profile" className="flex items-center gap-2">
					<img
						src={`https://devop-sso.smalabschoolunesa1.sch.id/${userData.img_location}`}
						alt="photo_profile"
						className="size-12 rounded-full bg-white"
					/>
					<p className="font-semibold text-sm ">
						{userData.nama_lengkap}
					</p>
				</div>
				<Link to="/notifikasi">
					<BellIcon className="fill-white size-8" />
				</Link>
			</nav>
			<div
				id="core"
				className="z-[2] size-full relative pb-24 overflow-y-auto"
			>
				<main className="mt-8 h-fit sm:h-52">
					<div id="news" className="size-full">
						<Carousel
							leftControl=" "
							rightControl=" "
							className="drop-shadow-[4px_4px_2px_rgba(0,0,0,0.5)] min-h-48 h-48"
						>
							<img src="/img/news.png" className="h-full" />
							<img src="/img/news.png" className="h-full" />
							<img src="/img/news.png" className="h-full" />
							<img src="/img/news.png" className="h-full" />
						</Carousel>
					</div>
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
										0
									</p>
								</div>
								<h4 className="text-center text-xs font-bold text-primary-md">
									Hadir
								</h4>
							</div>
							<div id="izin" className="w-24">
								<div className="mx-auto bg-secondary-yellow size-[50px] rounded-full p-[10px]">
									<p className="text-center text-lg font-bold">
										0
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
						to={
							localStorage.getItem("group_id") == "4"
								? "/presensi"
								: "/presensi/staff"
						}
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
				</main>
				<div className="fixed bottom-5 left-6 bg-white w-[calc(100vw-3rem)] h-14 py-2 px-4 rounded-s-full rounded-e-full flex justify-between z-10">
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
			<SideMenu show={show} data={userData} />
		</div>
	);
}
