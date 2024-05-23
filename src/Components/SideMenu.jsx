import {
	UserCircleIcon,
	Cog6ToothIcon,
	QuestionMarkCircleIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { getFormData, alert } from "../utils/utils";
import Swal from "sweetalert2";

export default function SideMenu({ show, data }) {
	let isLogout = false;
	const clickHandler = () => {
		isLogout = true;
		isLogout &&
			Swal.fire({
				title: "Logout",
				text: "Are you sure to logout ?",
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#3085d6",
				cancelButtonColor: "#d33",
				confirmButtonText: "Yes, logout!",
				allowOutsideClick: false,
				allowEnterKey: false,
				allowEscapeKey: false,
			}).then((result) => {
				if (result.isConfirmed) {
					const key = [
						"devop-sso",
						"AUTH_KEY",
						"csrf_token",
						"token",
					];
					const values = [
						localStorage.getItem("devop-sso"),
						localStorage.getItem("AUTH_KEY"),
						Cookies.get("csrf"),
						localStorage.getItem("login_token"),
					];
					apiXML
						.logout(
							localStorage.getItem("AUTH_KEY"),
							getFormData(key, values),
						)
						.then((res) => {
							res = JSON.parse(res);
							alert(
								"success",
								"Logout Succesfully",
								"You has been loged out!",
								() => {
									localStorage.clear();
									window.location.replace("/login");
								},
							);
						});
				} else {
					isLogout = false;
				}
			});
	};
	return (
		<div
			id="container"
			className={`${
				show ? "translate-x-[100vw]" : "translate-x-0"
			} w-screen h-screen absolute bg-transparent z-10 left-[-100vw] top-0 duration-500`}
		>
			<div className="relative w-3/4 h-full bg-white">
				<div className="size-full px-4">
					<img
						src="/Icons/Ellipse 190.svg"
						alt=""
						className="w-full absolute left-0 top-0"
					/>
					<div className="flex absolute top-0 left-0 justify-between w-full">
						<img
							src="/Icons/Group 117.svg"
							alt=""
							className="w-1/3"
						/>
						<img
							src="/Icons/Group 116.svg"
							alt=""
							className="w-1/3"
						/>
						<img
							src="/Icons/Group 115.svg"
							alt=""
							className="w-1/3"
						/>
					</div>
					<div id="bio" className="absolute top-9 left-4 flex gap-2">
						<img
							src={data.img_location || "/default-profile.png"}
							alt="photo_profile"
							className="size-12 rounded-full bg-white"
						/>
						<div className="font-normal text-base text-bg-2">
							<h4>Halo!</h4>
							<p>{data.nama_lengkap}</p>
						</div>
					</div>
					<div
						id="menu"
						className="absolute top-40 w-[65vw] sm:w-[65%] text-primary-high flex flex-col gap-4"
					>
						<Link
							to="/profile"
							className="w-full bg-bg-2 p-2 rounded-xl flex gap-3 items-center"
						>
							<UserCircleIcon className="size-9" />
							<p>Profil</p>
							<ChevronRightIcon className="size-5 stroke-2 ml-auto" />
						</Link>
						<Link
							to="/setting"
							className="w-full bg-bg-2 p-2 rounded-xl flex gap-3 items-center"
						>
							<Cog6ToothIcon className="size-9" />
							<p>Pengaturan</p>
							<ChevronRightIcon className="size-5 stroke-2 ml-auto" />
						</Link>
						<Link
							to="/bantuan"
							className="w-full bg-bg-2 p-2 rounded-xl flex gap-2 items-center"
						>
							<QuestionMarkCircleIcon className="size-9" />
							<p>Bantuan</p>
							<ChevronRightIcon className="size-5 stroke-2 ml-auto" />
						</Link>
					</div>
					<button
						onClick={clickHandler}
						className="btn border-none w-4/5 py-3 px-16 bg-primary-low text-center font-bold rounded-xl absolute bottom-4 left-[10%]"
					>
						Keluar
					</button>
				</div>
			</div>
		</div>
	);
}
