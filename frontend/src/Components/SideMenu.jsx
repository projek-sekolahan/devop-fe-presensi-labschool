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
import { getFormData, alertMessage, addDefaultKeys, loading } from "../utils/utils";
import Swal from "sweetalert2";
import { useEffect } from "react";
export default function SideMenu({ showMenu, userData, closeMenu, intervalId }) {
	useEffect(() => {
		if (!userData) {
		  console.log("User data not available, skipping render.");
		  return () => {
			console.log("Sidemenu component unmounted.");
		  };
		}
		console.log("Sidemenu component mounted or updated.", userData);
	}, []);
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
					loading("Loading", "Logging out...");
					// Clear interval
					clearInterval(intervalId);
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
								"Logout Succesfully",
								"You has been loged out!",
								"success",
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
				showMenu ? "translate-x-0" : "translate-x-[100vw]"
			} w-screen h-screen absolute bg-transparent z-10 left-0 top-0 duration-500`}
		>
			<div className="relative w-full h-full">
				<div className="size-full">
					<div id="bio">
						<img
							src={userData?.img_location || "/default-profile.png"}
							alt="photo_profile"
						/>
						<div className="user-info">
							<h4>Halo!</h4>
							<p>{userData?.nama_lengkap}</p>
						</div>
						<button class="px-4 mt-6" onClick={closeMenu}>
						<XMarkIcon className="icon" />
						</button>
					</div>
					<div id="menu">
						<Link to="/profile">
							<UserCircleIcon className="icon" />
							<p>Profil</p>
							<ChevronRightIcon className="w-5 h-5 stroke-2 ml-auto" />
						</Link>
						<Link to="/setting">
							<Cog6ToothIcon className="icon" />
							<p>Pengaturan</p>
							<ChevronRightIcon className="w-5 h-5 stroke-2 ml-auto" />
						</Link>
						<Link to="/bantuan">
							<QuestionMarkCircleIcon className="icon" />
							<p>Bantuan</p>
							<ChevronRightIcon className="w-5 h-5 stroke-2 ml-auto" />
						</Link>
						<Link to="#" onClick={clickHandler} className="btn">
							<PowerIcon className="icon" />
							<p>Logout</p>
							<ArrowRightIcon className="w-5 h-5 stroke-2 ml-auto" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}