import {
	ArrowLeftIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import RaiseHandIcon from "pepicons/svg/pop/raise-hand.svg?react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useClock } from "../utils/utils";

export default function PresensiStaff() {
	const timeRef = useRef(null);
	const dateRef = useRef(null);
	const dayRef = useRef(null);
	const { state } = useLocation();

	useClock(timeRef, dateRef, dayRef);
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px) relative text-white">
			<header className="h-1/5 bg-primary-md relative p-6">
				<Link to="/home" className="absolute top-5">
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-[2.125rem] font-bold absolute bottom-5">
					Presensi
				</h2>
			</header>
			<main className="w-full h-full relative bottom-0 left-0 px-8 pt-10 pb-4 text-primary-md">
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
							to="/presensi/bukti"
							state={["dinas-luar"]}
							className="p-5 bg-secondary-green rounded-md flex flex-col justify-center items-center"
						>
							<img
								src="/Icons/exit-run.svg"
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
