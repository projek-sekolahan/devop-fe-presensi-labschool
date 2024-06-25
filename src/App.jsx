import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import apiXML from "./utils/apiXML.js";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Register from "./Pages/Register";
import Loading from "./Pages/Loading";

const OtpInput = lazy(() => import("./Pages/OtpInput"));
const Login = lazy(() => import("./Pages/Login"));
const ChangePassword = lazy(() => import("./Pages/ChangePassword"));
const Home = lazy(() => import("./Pages/Home"));
const Profile = lazy(() => import("./Pages/Profile"));
const Presensi = lazy(() => import("./Pages/Presensi"));
const Riwayat = lazy(() => import("./Pages/Riwayat"));
const Bantuan = lazy(() => import("./Pages/Bantuan"));
const Notification = lazy(() => import("./Pages/Notification"));
const Izin = lazy(() => import("./Pages/Izin"));
const Pengaturan = lazy(() => import("./Pages/Pengaturan"));
const PresensiStaff = lazy(() => import("./Pages/PresensiStaff"));
const FaceVerification = lazy(() => import("./Pages/FaceVerification"));
const FaceCam = lazy(() => import("./Pages/FaceCam"));
const Errors = lazy(() => import("./Pages/Error"));
const RegisterFace = lazy(() => import("./Pages/RegisterFace"));
const SetPassword = lazy(() => import("./Pages/SetPassword"));

// let isMobile = false;

// function isMobileCheck(trueCallback, falseCallback) {
// 	if (
// 		/Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(
// 			navigator.userAgent,
// 		)
// 	) {
// 		trueCallback();
// 	} else {
// 		falseCallback();
// 	}
// }

function App() {
	// isMobileCheck(
	// 	() => (isMobile = true),
	// 	() => (isMobile = false),
	// );

	// console.log(isMobile);

	useEffect(() => {
		apiXML.getCsrf();

		if (!localStorage.getItem("cookiesAccepted")) {
			Swal.fire({
				title: "Allow Cookies",
				text: "Kami menggunakan cookie untuk meningkatkan pengalaman Anda.",
				icon: "warning",
				allowOutsideClick: false,
				allowEnterKey: false,
				allowEscapeKey: false,
			});
			Cookies.set("cookiesAccepted", "true", {
				expires: 2 * 60 * 60 * 1000,
			}); // Set cookie untuk 1 tahun
			localStorage.setItem("cookiesAccepted", "true");
		}

		// const handleResize = () => {
		// 	isMobileCheck(
		// 		() => (isMobile = true),
		// 		() => (isMobile = false),
		// 	);
		// };

		// handleResize(); // Initial check

		// window.addEventListener("resize", handleResize);

		// Cleanup event listener on unmount
		// return () => {
		// 	window.removeEventListener("resize", handleResize);
		// };
	}, []);
	return (
		<Router>
			{(
		/Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(
			navigator.userAgent,
		) ? (
				<div className="font-primary w-screen h-screen absolute left-0 top-0 z-50 flex justify-center items-center before:size-full before:bg-black before:opacity-40 backdrop-blur-sm before:absolute">
					<div className="modal-box">
						<h3 className="font-bold text-xl">Warning!</h3>
						<p className="py-4 text-lg">
							Harap gunakan Handphone agar dapat mengakses website
						</p>
					</div>
				</div>
			) : null}
			<Suspense fallback={<Loading />}>
				<Routes>
					<Route path="/register" element={<Register />} />
					<Route path="/verify" element={<OtpInput />} />
					<Route path="/facereg" element={<RegisterFace />} />
					<Route path="/login" element={<Login />} />
					<Route path="/recover" element={<ChangePassword />} />
					<Route path="/home" element={<Home />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/presensi" element={<Presensi />} />
					<Route path="/riwayat" element={<Riwayat />} />
					<Route path="/bantuan" element={<Bantuan />} />
					<Route path="/notifikasi" element={<Notification />} />
					<Route path="/presensi/staff" element={<PresensiStaff />} />
					<Route
						path="/presensi/verif"
						element={<FaceVerification />}
					/>
					<Route path="/presensi/izin" element={<Izin />} />
					<Route path="/setting" element={<Pengaturan />} />
					<Route path="/facecam" element={<FaceCam />} />
					<Route path="/setpassword" element={<SetPassword />} />
					<Route path="/" element={<Register />} />
					<Route path="*" element={<Errors />} />
				</Routes>
			</Suspense>
		</Router>
	);
}
export default App;
