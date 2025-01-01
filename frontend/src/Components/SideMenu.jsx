import {
	UserCircleIcon,
	Cog6ToothIcon,
	QuestionMarkCircleIcon,
	ChevronRightIcon,
	XMarkIcon,
	PowerIcon,
	ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";
import { getFormData, alertMessage, addDefaultKeys } from "../utils/utils";
import Swal from "sweetalert2";

export default function SideMenu({ show, userData, closeMenu }) {
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
				showConfirmButton: true,
				allowEscapeKey: false,
			}).then((result) => {
				if (result.isConfirmed) {
					const key = ["AUTH_KEY", "token"];
					const combinedKeys = addDefaultKeys(key);
					const values = [
						localStorage.getItem("AUTH_KEY"),
						localStorage.getItem("login_token"),
						localStorage.getItem("devop-sso"),
						Cookies.get("csrf"),
					];
					apiXML
						.authPost(
							"logout",
							localStorage.getItem("AUTH_KEY"),
							getFormData(combinedKeys, values),
						)
						.then((res) => {
							localStorage.clear();
							res = JSON.parse(res);
							alertMessage(
								"success",
								"Logout Succesfully",
								"You has been loged out!",
								() => {
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
						src="/frontend/Icons/Ellipse 190.svg"
						alt=""
						className="w-full absolute left-0 top-0"
					/>
					<div className="flex absolute top-0 left-0 justify-between w-full">
						<img
							src="/frontend/Icons/Group 117.svg"
							alt=""
							className="w-1/3"
						/>
						<img
							src="/frontend/Icons/Group 116.svg"
							alt=""
							className="w-1/3"
						/>
						<img
							src="/frontend/Icons/Group 115.svg"
							alt=""
							className="w-1/3"
						/>
					</div>
					<div id="bio" className="absolute top-9 left-4 flex gap-2">
						<img
							src={userData?.img_location || "/default-profile.png"}
							alt="photo_profile"
							className="size-12 rounded-full bg-white"
						/>
						<div className="font-normal text-base text-bg-2">
							<h4>Halo!</h4>
							<p>{userData?.nama_lengkap}</p>
						</div>
						<button
						onClick={closeMenu}
						className="absolute top-0 right-0 text-xl font-bold text-bg-2"
						>
						<XMarkIcon className="w-6 h-6 text-bg-2" />
						</button>
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
		<Link
          to="#"
          onClick={clickHandler}
          className="btn border-none w-full py-3 px-16 bg-primary-low text-center font-bold rounded-xl mt-4 flex gap-3 justify-center items-center"
        >
          <PowerIcon className="w-5 h-5 text-white" />
          Logout
          <ArrowRightIcon className="w-5 h-5 text-white ml-auto" />
        </Link>
					</div>
				</div>
			</div>
		</div>
	);
}