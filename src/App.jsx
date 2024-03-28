import { Suspense, lazy } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import { getCsrf } from "./utils/api";
import Register from "./Pages/Register";
import Cookies from "js-cookie";
// import OtpInput from "./Pages/OtpInput";
import Loading from "./Pages/Loading";
// import Login from "./Pages/Login";
// import ChangePassword from "./Pages/ChangePassword";
// import Home from "./Pages/Home";
// import Profile from "./Pages/Profile";
// import Presensi from "./Pages/Presensi";
// import Riwayat from "./Pages/Riwayat";
// import Bantuan from "./Pages/Bantuan";
// import Notification from "./Pages/Notification";
// import Sakit from "./Pages/Sakit";
// import Ijin from "./Pages/Ijin";
// import Pengaturan from "./Pages/Pengaturan";
// import PresensiStaff from "./Pages/PresensiStaff";
// import FaceVerification from "./Pages/FaceVerification";
// import FaceCam from "./Pages/FaceCam";
// import Errors from "./Pages/Error";
// import RegisterFace from "./Pages/RegisterFace";

const OtpInput = lazy(() => import("./Pages/OtpInput"));
const Login = lazy(() => import("./Pages/Login"));
const ChangePassword = lazy(() => import("./Pages/ChangePassword"));
const Home = lazy(() => import("./Pages/Home"));
const Profile = lazy(() => import("./Pages/Profile"));
const Presensi = lazy(() => import("./Pages/Presensi"));
const Riwayat = lazy(() => import("./Pages/Riwayat"));
const Bantuan = lazy(() => import("./Pages/Bantuan"));
const Notification = lazy(() => import("./Pages/Notification"));
const Sakit = lazy(() => import("./Pages/Sakit"));
const Ijin = lazy(() => import("./Pages/Ijin"));
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
		getCsrf().then((result) => {
			// Data cookie yang diberikan
			localStorage.setItem("csrf", result.data.csrfHash);
			const cookieData = {
				ci_sso_csrf_cookie: result.data.csrfHash,
				"Max-Age": 1 / 12,
			};
			// if (Cookies.get("ci_sso_csrf_cookie")) {
			// 	Cookies.remove("ci_sso_csrf_cookie");
			// }
			// Set cookie menggunakan js-cookies
			Object.keys(cookieData).forEach((key) => {
				const cookieValue = cookieData[key];
				Cookies.set(key, cookieValue, {
					expires: cookieData["Max-Age"], // Konversi Max-Age menjadi jumlah detik
				});
			});
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
					<Route path="/" Component={Register} />
					<Route path="/verify/:to" Component={OtpInput} />
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
					<Route
						path="/presensi/verif"
						Component={FaceVerification}
					/>
					<Route path="/presensi/bukti" Component={Sakit} />
					<Route path="/presensi/keterangan" Component={Ijin} />
					<Route path="/setting" Component={Pengaturan} />
					<Route path="/facecam" Component={FaceCam} />
					<Route path="/setpassword" Component={SetPassword} />
					<Route path="*" Component={Errors} />
				</Routes>
			</Suspense>
		</Router>
	);
}

export default App;
