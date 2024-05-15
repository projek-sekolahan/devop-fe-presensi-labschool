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
import { parseJwt, getFormData, alert } from "../utils/utils";
import apiXML from "../utils/apiXML.js";
import Loading from "./Loading";

const checkSession = () => {
	const key = ["devop-sso", "AUTH_KEY", "csrf_token"];
	const value = [
		localStorage.getItem("devop-sso"),
		localStorage.getItem("AUTH_KEY"),
		localStorage.getItem("csrf"),
	];
	apiXML
		.sessTime(localStorage.getItem("AUTH_KEY"), getFormData(key, value))
		.then((res) => {
			res = JSON.parse(res);
			if (res.data.title == "Your Session OK") {
				localStorage.removeItem("csrf");
				localStorage.setItem("csrf", res.csrfHash);
			} else {
				alert("error", res.data.title, res.data.message, () => {
					localStorage.clear();
					window.location.replace("/login");
				});
			}
		})
		.catch((err) => {
			if (err.status == 403) {
				localStorage.clear();
				alert(
					"error",
					"Credential Expired",
					"Your credentials has expired. Please login again.",
					() => window.location.replace("/login")
				);
			} else {
				err = JSON.parse(err.responseText);
				localStorage.clear();
				alert(err.data.info, err.data.title, err.data.message, () =>
					window.location.replace("/login")
				);
			}
		});
};
setInterval(checkSession(), 20000);

export default function Home() {
	const [show, setShow] = useState(false);
	const [userData, setUserData] = useState(null);
	userData && localStorage.setItem("group_id", userData.group_id);

	if (!localStorage.getItem("login_token")) {
		window.location.replace("/login");
	}

	const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token"];
	const values = [
		localStorage.getItem("AUTH_KEY"),
		localStorage.getItem("devop-sso"),
		localStorage.getItem("csrf"),
		localStorage.getItem("login_token"),
	];

	!userData &&
		apiXML
			.getUserData(
				localStorage.getItem("AUTH_KEY"),
				getFormData(keys, values)
			)
			.then((getUserDataResponse) => {
				const res = JSON.parse(getUserDataResponse);
				console.log(res);
				localStorage.setItem("token", res.data);
				localStorage.setItem("csrf", res.csrfHash);
				setUserData(parseJwt(localStorage.getItem("token")));
			})
			.catch(() => {
				window.location.replace("/login");
			});
	window.addEventListener("click", (e) => {
		if (e.pageX > (screen.width * 75) / 100) {
			setShow(false);
		}
	});

	const click = () => {
		apiXML
			.create(
				localStorage.getItem("AUTH_KEY"),
				getFormData(
					[
						"AUTH_KEY",
						"devop-sso",
						"csrf_token",
						"token",
						"type",
						"category",
						"title",
						"message",
						"url",
						"is_read",
					],
					[
						localStorage.getItem("AUTH_KEY"),
						localStorage.getItem("devop-sso"),
						localStorage.getItem("csrf"),
						localStorage.getItem("login_token"),
						"succes",
						"notifikasi",
						"Presensi Berhasil",
						"thankss",
						"/riwayat",
						"0",
					]
				)
			)
			.then((getResponse) => {
				const res = JSON.parse(getResponse);
				localStorage.setItem("csrf", res.csrfHash);
				console.log(parseJwt(res.data));
			});
	};

	return !userData ? (
		<Loading />
	) : (
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
										{userData.hadir ? userData.hadir : "0"}
									</p>
								</div>
								<h4 className="text-center text-xs font-bold text-primary-md">
									Hadir
								</h4>
							</div>
							<div id="izin" className="w-24">
								<div className="mx-auto bg-secondary-yellow size-[50px] rounded-full p-[10px]">
									<p className="text-center text-lg font-bold">
										{userData.tidak_hadir
											? userData.tidak_hadir
											: "0"}
									</p>
								</div>
								<h4 className="text-center text-xs font-bold text-primary-md">
									Izin / Sakit
								</h4>
							</div>
							<div id="terlambat" className="w-24">
								<div className="mx-auto bg-secondary-red size-[50px] rounded-full p-[10px]">
									<p className="text-center text-lg font-bold">
										{userData.terlambat_pulang_cepat
											? userData.terlambat_pulang_cepat
											: "0"}
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
					<button onClick={click} className="btn">
						test
					</button>
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
