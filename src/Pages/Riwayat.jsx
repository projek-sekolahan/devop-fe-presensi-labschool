import { Link } from "react-router-dom";
import {
	ArrowLeftIcon,
	ChevronUpIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import CardRiwayat from "../Components/CardRiwayat";

export default function Riwayat() {
	const [filter, setFilter] = useState("Pilih Durasi Hari");
	const [swapButton, setSwapButton] = useState(["on", "off"]);

	let userData = {};
	if (localStorage.getItem("token")) {
		userData = parseJwt(localStorage.getItem("token"));
	} else {
		window.location.replace("/login");
	}

	window.addEventListener("click", (e) => {
		const dropdown = document.getElementById("dropdown");
		const dropdownContent = document.getElementById("dropdown-content");
		if (!dropdown.contains(e.target) && swapButton[0] == "off") {
			dropdownContent.classList.add("hidden");
			setSwapButton(["on", "off"]);
		}
	});

	const historys = [
		{
			date: "Rabu, 23 Februari 2024",
			status: "Terlambat",
			checkIn: "07:15:00 WIB",
			checkOut: "15:00:00 WIB",
		},
		{
			date: "Kamis, 24 Februari 2024",
			status: "Masuk",
			checkIn: "06:59:00 WIB",
			checkOut: "15:00:00 WIB",
		},
		{
			date: "Jumat, 25 Februari 2024",
			status: "Masuk",
			checkIn: "06:45:00 WIB",
			checkOut: "15:00:00 WIB",
		},
		{
			date: "Senin, 28 Februari 2024",
			status: "Izin",
			checkIn: "",
			checkOut: "",
		},
	];

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
								}}
							>
								14 Hari
							</button>
						</li>
					</ul>
				</div>
				{historys.map((history, i) => {
					return (
						<CardRiwayat
							key={i}
							history={history}
							biodata={userData}
						/>
					);
				})}
			</main>
		</div>
	);
}
