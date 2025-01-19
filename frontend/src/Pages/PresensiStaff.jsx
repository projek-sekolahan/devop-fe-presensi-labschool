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
				<h1 className="presensi-section-container">Presensi</h1>
			</header>
			<main>
				
			</main>
		</div>
	);
}