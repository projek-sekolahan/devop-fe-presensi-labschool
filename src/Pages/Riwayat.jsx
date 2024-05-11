import { Link } from "react-router-dom";
import {
	ArrowLeftIcon,
	ChevronUpIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import CardRiwayat from "../Components/CardRiwayat";
import { parseJwt, getFormData, alert} from "../utils/utils";
import apiXML from "../utils/apiXML";

export default function Riwayat() {
	const [filter, setFilter] = useState("7 Hari");
	const [swapButton, setSwapButton] = useState(["on", "off"]);
	const [historys, setHistorys] = useState(null);
	const [load, setLoad] = useState(true);

	let userData = {};

	if (localStorage.getItem("token")) {
		userData = parseJwt(localStorage.getItem("token"));
	} else {
		window.location.replace("/login");
	} 

	userData = parseJwt(localStorage.getItem("token"));

	window.addEventListener("click", (e) => {
		const dropdown = document.getElementById("dropdown");
		const dropdownContent = document.getElementById("dropdown-content");
		if (!dropdown.contains(e.target) && swapButton[0] == "off") {
			dropdownContent.classList.add("hidden");
			setSwapButton(["on", "off"]);
		}
	}); 

	const keys = [
		"AUTH_KEY",
		"devop-sso",
		"csrf_token",
		"token",
		"table",
		"key",
	];
	let values = [
		localStorage.getItem("AUTH_KEY"),
		localStorage.getItem("devop-sso"),
		localStorage.getItem("csrf"),
		localStorage.getItem("login_token"),
		"tab-presensi",
	];
	filter == "7 Hari"
		? (values = [...values, "7 DAY"])
		: (values = [...values, "14 DAY"]);
	!historys &&
		load &&
		apiXML
			.reports(
				localStorage.getItem("AUTH_KEY"),
				getFormData(keys, values),
			)
			.then((res) => {
				res = JSON.parse(res);
				localStorage.removeItem("csrf");
				localStorage.setItem("csrf", res.csrfHash);
				const { data } = parseJwt(res.data);
				console.log(data);
				setHistorys(data);
				setLoad(false);
			}).catch((err) => {
				if(err.status == 403) {
					localStorage.clear();
					alert(
						"error",
						"Credential Expired",
						"Your credentials has expired. Please login again.",
						() => window.location.replace("/login"),
					)
				} else {
					err = JSON.parse(err.responseText);
					localStorage.setItem("csrf", err.csrfHash);
					alert(
						err.data.info,
						err.data.title,
						err.data.message,
						() => window.location.replace("/home"),
					)
				}
			});

	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white">
			<header className="h-1/5 min-h-[130px] bg-primary-md relative p-6">
				<Link to="/home" className="absolute top-5">
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-[2.125rem] font-bold absolute bottom-5">
					Riwayat Presensi
				</h2>
			</header>
			<main className="w-full h-full relative bottom-0 left-0 px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
				<div id="dropdown" className="w-fit mt-[-1.5rem]">
					<button
						className="btn m-1 ml-0 bg-white border-none text-bg-3 btn-sm flex justify-between items-center"
						onClick={() => {
							swapButton[0] == "on"
								? setSwapButton(["off", "on"])
								: setSwapButton(["on", "off"]);
						}}
					>
						<p>{filter}</p>
						<ChevronDownIcon
							className={`${
								swapButton[0] == "on" ? "" : "hidden"
							} size-5`}
						/>
						<ChevronUpIcon
							className={`${
								swapButton[1] == "on" ? "" : "hidden"
							} size-5`}
						/>
					</button>
					<ul
						tabIndex={0}
						id="dropdown-content"
						className={`${
							swapButton[0] == "off" ? "" : "hidden"
						} absolute z-[1] menu p-2 shadow bg-white rounded-box w-52`}
					>
						<li>
							<button
								onClick={() => {
									setFilter("7 Hari");
									setSwapButton(["on", "off"]);
									setHistorys(null);
									setLoad(true);
								}}
							>
								7 Hari
							</button>
						</li>
						<li>
							<button
								onClick={() => {
									setFilter("14 Hari");
									setSwapButton(["on", "off"]);
									setHistorys(null);
									setLoad(true);
								}}
							>
								14 Hari
							</button>
						</li>
					</ul>
				</div>
				{load ? (
					<div className="size-full flex justify-center items-center">
						<span className="loading loading-spinner text-white"></span>
					</div>
				) : historys ? (
					historys.map((history, i) => {
						return (
							<CardRiwayat
								key={i}
								history={history}
								biodata={userData}
							/>
						);
					})
				) : (
					<div className="size-full flex justify-center items-center">
						<p className="text-white">Belum ada riwayat.</p>
					</div>
				)}
			</main>
		</div>
	);
}
