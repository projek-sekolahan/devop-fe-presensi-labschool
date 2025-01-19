import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaHouseUser, FaBuildingUser  } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useClock } from "../utils/utils";

export default function PresensiStaff() {
	const timeRef = useRef(null);
	const dateRef = useRef(null);
	const dayRef = useRef(null);

	useClock(timeRef, dateRef, dayRef);
	return (
		<div className="presensi-container">
			<header>
				<Link to="/home">
					<ArrowLeftIcon className="w-6 h-6 text-white" />
				</Link>
				<h1 className="presensi-section-container">Presensi</h1>
			</header>
			<main>
				<div className="custom-card">
					<div className="flex justify-between items-center w-full">
						<p ref={timeRef} className="text-lg font-semibold"></p>
						<div className="text-lg font-bold">
							<small ref={dayRef}></small>
							<small ref={dateRef}></small>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Link
							to="/presensi"
							state={["non-dinas"]}
							className="presensi-icon-container"
						>
							<FaHouseUser className="size-20" />
							<p className="text-center font-semibold">
								Non-Dinas
							</p>
						</Link>
						<Link
							to="/presensi/izin"
							state={{ kode: 1, ket: ["dinas-luar"] }}
							className="presensi-icon-container"
						>
							<FaBuildingUser className="size-20" />
							<p className="text-center font-semibold">
								Dinas Luar
							</p>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}