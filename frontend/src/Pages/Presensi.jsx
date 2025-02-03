import { FaHospitalUser, FaHouseChimneyUser  } from "react-icons/fa6";
import { BiLogInCircle, BiLogOutCircle } from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import { useClock } from "../utils/utils";
import Layout from "../Components/Layout";

export default function Presensi() {
	const timeRef = useRef(null);
	const dateRef = useRef(null);
	const dayRef = useRef(null);
	const { state } = useLocation();
	useClock(timeRef, dateRef, dayRef);

	return (
		<div className="presensi-container">
			<Layout link={
						localStorage.getItem("group_id") == "4"
							? "/home"
							: "/presensi/staff"
					} label="Presensi">
				<div className="custom-card mt-10">
					<div className="flex justify-between items-center w-full">
						<p ref={timeRef} className="text-lg font-semibold"></p>
						<div className="text-lg font-bold">
							<small ref={dayRef}></small>
							<small ref={dateRef}></small>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Link
							to="/presensi/verif"
							state={state ? [...state, "masuk"] : ["masuk"]}
							className="presensi-icon-container"
						>
							<BiLogInCircle className="size-20" />
							<p className="text-center font-semibold">Masuk</p>
						</Link>
						<Link
							to="/presensi/verif"
							state={state ? [...state, "pulang"] : ["pulang"]}
							className="presensi-icon-container"
						>
							<BiLogOutCircle className="size-20" />
							<p className="text-center font-semibold">Pulang</p>
						</Link>
						<Link
							to="/presensi/izin"
							state={
								state
									? { kode: 2, ket: [...state, "sakit"] }
									: { kode: 2, ket: ["sakit"] }
							}
							className="presensi-icon-container"
						>
							<FaHospitalUser className="size-20" />
							<p className="text-center font-semibold">Sakit</p>
						</Link>
						<Link
							to="/presensi/izin"
							state={
								state
									? { kode: 3, ket: [...state, "izin"] }
									: { kode: 3, ket: ["izin"] }
							}
							className="presensi-icon-container"
						>
							<FaHouseChimneyUser className="size-20" />
							<p className="text-center font-semibold">Izin</p>
						</Link>
					</div>
				</div>			
			</Layout>
		</div>
	);
}