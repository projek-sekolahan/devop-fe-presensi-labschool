import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import RaiseHandIcon from "pepicons/svg/pop/raise-hand.svg?react";
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

				<h2 className="text-[2.125rem] font-bold absolute bottom-5">
					Presensi
				</h2>
			</header>
			<main>
				<div className="bg-white w-full rounded-xl p-4 flex flex-col gap-2">
					<div className="flex justify-between items-center w-full">
						<p ref={timeRef} className="text-lg font-semibold"></p>
						<div className="text-lg font-bold">
							<small ref={dayRef}></small>
							<small ref={dateRef}></small>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2 text-white">
						<Link
							to="/presensi"
							state={["non-dinas"]}
							className="p-5 bg-secondary-green rounded-md flex flex-col justify-center items-center"
						>
							<RaiseHandIcon className="size-20" />
							<p className="text-center font-semibold">
								Non-Dinas
							</p>
						</Link>
						<Link
							to="/presensi/izin"
							state={{ kode: 1, ket: ["dinas-luar"] }}
							className="p-5 bg-secondary-green rounded-md flex flex-col justify-center items-center"
						>
							<img
								src="/frontend/Icons/exit-run.svg"
								className="size-20"
							/>
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