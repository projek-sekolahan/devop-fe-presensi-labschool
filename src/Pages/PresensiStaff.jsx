import {
	ArrowLeftIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import RaiseHandIcon from "pepicons/svg/pop/raise-hand.svg?react";
import { DoctorRegular } from '@fluentui/react-icons';
import { Link } from "react-router-dom";

export default function PresensiStaff() {
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
					<p>09:41 WIB</p>
					<small>Tanggal : 23-02-2023</small>
					<div className="grid grid-cols-2 gap-2 text-white">
						<Link className="p-5 bg-secondary-green rounded-md flex flex-col justify-center items-center">
							<RaiseHandIcon className="size-20" />
							<p className="text-center font-semibold">Dinas Luar</p>
						</Link>
						<Link className="p-5 bg-secondary-green rounded-md flex flex-col justify-center items-center">
							<img src="/Icons/exit-run.svg" className="size-20"/>
							<p className="text-center font-semibold">Non-Dinas</p>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
