import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Label, Textarea } from "flowbite-react";

export default function Ijin() {
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px) relative text-white">
			<header className="h-1/5 bg-primary-md relative p-6">
				<Link to="/presensi" className="absolute top-5">
					<ArrowLeftIcon className="size-7" />
				</Link>
				<h2 className="text-[2.125rem] font-bold absolute bottom-5">
					Bukti Pendukung
				</h2>
			</header>
			<main className="w-full h-full px-8 pt-10 pb-4 text-white">
				<div className="max-w-md">
					<div className="mb-2 block">
						<Label htmlFor="comment" value="Keterangan" className="text-white"/>
					</div>
					<Textarea
						id="comment"
						placeholder="Leave a comment..."
						required
						rows={4}
					/>
				</div>
			</main>
		</div>
	);
}
