import {
	ArrowLeftIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import RaiseHandIcon from "pepicons/svg/pop/raise-hand.svg?react";
import { DoctorRegular } from "@fluentui/react-icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Presensi() {
	const timeRef = useRef();
	const dateRef = useRef();
	const { state } = useLocation();

	useEffect(() => {
		const interval = setInterval(() => {
			const currentTime = new Date()
				.toLocaleTimeString()
				.split(".")
				.join(":");
			const currentDate = new Date()
				.toLocaleDateString()
				.split("/")
				.join("-");
			if (timeRef && dateRef) {
				timeRef.current.innerText = `${currentTime} WIB`;
				dateRef.current.innerText = `Tanggal : ${currentDate}`;
			}
		}, 1000);
		return () => clearInterval(interval);
	}, []);
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px) relative text-white">
			<header className="h-1/5 bg-primary-md relative p-6">
				<Link
					to={
						localStorage.getItem("group_id") == "4"
							? "/home"
							: "/presensi/staff"
					}
					className="absolute top-5"
				>
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-[2.125rem] font-bold absolute bottom-5">
					Presensi
				</h2>
			</header>
			<main className="w-full h-full relative bottom-0 left-0 px-8 pt-10 pb-4 text-primary-md">
				<div className="bg-white w-full rounded-xl p-4 flex flex-col gap-2">
					<p
						ref={timeRef}
					>{`${new Date().toLocaleTimeString().split(".").join(":")} WIB`}</p>
					<small
						ref={dateRef}
					>{`Tanggal : ${new Date().toLocaleDateString().split("/").join("-")}`}</small>
					<div className="grid grid-cols-2 gap-2 text-white">
						<Link
							to="/presensi/verif"
							state={state ? [...state, "masuk"] : ["masuk"]}
							className="p-5 bg-secondary-green rounded-md flex flex-col justify-center items-center"
						>
							<RaiseHandIcon className="size-20" />
							<p className="text-center font-semibold">Masuk</p>
						</Link>
						<Link
							to="/presensi/verif"
							state={state ? [...state, "pulang"] : ["pulang"]}
							className="p-5 bg-secondary-green rounded-md flex flex-col justify-center items-center"
						>
							<img
								src="/Icons/exit-run.svg"
								className="size-20"
							/>
							<p className="text-center font-semibold">Pulang</p>
						</Link>
						<Link
							to="/presensi/izin"
							state={
								state
									? { kode: 2, ket: [...state, "sakit"] }
									: { kode: 2, ket: ["sakit"] }
							}
							className="p-5 bg-secondary-red rounded-md flex flex-col justify-center items-center"
						>
							<DoctorRegular
								className="size-20"
								strokeWidth="1.5"
							/>
							<p className="text-center font-semibold">Sakit</p>
						</Link>
						<Link
							to="/presensi/izin"
							state={
								state
									? { kode: 3, ket: [...state, "izin"] }
									: { kode: 3, ket: ["sakit"] }
							}
							className="p-5 bg-secondary-yellow rounded-md flex flex-col justify-center items-center"
						>
							<ExclamationTriangleIcon className="size-20 stroke-[2.5]" />
							<p className="text-center font-semibold">Izin</p>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
