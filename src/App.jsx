import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import apiXML from "./utils/apiXML.js";
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

function App() {
	const [width, setWidth] = useState(window.screen.width);

	useEffect(() => {
		window.addEventListener("resize", () => {
			setWidth(window.screen.width);
		});
		apiXML.getCsrf().then((result) => {
			console.log(result);
			// Data yang diberikan
			localStorage.getItem("csrf") && localStorage.removeItem("csrf");
			localStorage.setItem("csrf", result.csrfHash);
		}).catch((err) => {
			console.log(err);
		});
	}, []);

	return (
		<Router>
			{width && width > 500 ? (
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
					<Route path="/register" Component={Register} />
					<Route path="/verify" Component={OtpInput} />
					<Route path="/facereg" Component={RegisterFace} />
					<Route path="/login" Component={Login} />
					<Route path="/recover" Component={ChangePassword} />
					<Route path="/home" Component={Home} />
					<Route path="/profile" Component={Profile} />
					<Route path="/presensi" Component={Presensi} />
					<Route path="/riwayat" Component={Riwayat} />
					<Route path="/bantuan" Component={Bantuan} />
					<Route path="/notifikasi" Component={Notification} />
					<Route path="/presensi/staff" Component={PresensiStaff} />
					<Route path="/presensi/verif" Component={FaceVerification} />
					<Route path="/presensi/izin" Component={Izin} />
					<Route path="/setting" Component={Pengaturan} />
					<Route path="/facecam" Component={FaceCam} />
					<Route path="/setpassword" Component={SetPassword} />
					<Route path="/" Component={Register} />
					<Route path="*" Component={Errors} />
				</Routes>
			</Suspense>
		</Router>
	);
}
export default App;
