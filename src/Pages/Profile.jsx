import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ChangeModal from "../Components/ChangeModal";

export default function Profile() {
	const biodata = {
		name: "Fata Nadhira Putri",
		email: "nadhiracantik@student.ub.ac.id",
		number: "+6212345678",
	};
	return (
		<div className="border-red-500 border-2 font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-8 relative text-white px-6">
			<div
				id="id"
				className="absolute w-full top-0 left-0 bg-primary-md rounded-b-[3rem] p-6 sm:p-8"
			>
				<Link to="/home">
					<ArrowLeftIcon className="size-7 absolute top-8 left-6" />
				</Link>
				<h2 className="text-center font-bold text-lg">Profil</h2>
				<img
					src="https://source.unsplash.com/woman-in-white-shirt-holding-green-plant-6l2SLnzdF-A/600x600"
					alt="photo_profile"
					className="size-28 rounded-full bg-white mt-6 mx-auto"
				/>
				<p
					id="name"
					className="text-center text-base font-semibold mt-3"
				>
					{biodata.name}
				</p>
			</div>
			<div id="bio" className="text-bg-3 mt-64 flex flex-col gap-4">
				<div id="name">
					<h3 className="text-base font-medium text-black">Name</h3>
					<div className="relative flex border-[1px] border-bg-3 p-3 items-center rounded-2xl top-2">
						<p>{biodata.name}</p>
						<PencilSquareIcon className="size-6 absolute right-4" />
					</div>
				</div>
				<div id="email">
					<h3 className="text-base font-medium text-black">
						Account Email
					</h3>
					<div className="relative flex border-[1px] border-bg-3 p-3 items-center rounded-2xl top-2">
						<p>{biodata.email}</p>
						<button
							className="absolute right-4"
							onClick={() => {
								return <ChangeModal mail={biodata.email} open={true}/>
							}}
						>
							<PencilSquareIcon className="size-6" />
						</button>
					</div>
				</div>
				<div id="number">
					<h3 className="text-base font-medium text-black">
						Phone Number
					</h3>
					<div className="relative flex border-[1px] border-bg-3 p-3 items-center rounded-2xl top-2">
						<p>{biodata.number}</p>
						<PencilSquareIcon className="size-6 absolute right-4" />
					</div>
				</div>
			</div>
		</div>
	);
}
