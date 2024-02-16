import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import Register from "./Pages/Register";
import OtpInput from "./Pages/OtpInput";
import Login from "./Pages/Login";
import ChangePassword from "./Pages/ChangePassword";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import Presensi from "./Pages/Presensi";
import Riwayat from "./Pages/Riwayat";
import Bantuan from "./Pages/Bantuan";
import Notification from "./Pages/Notification";
import Sakit from "./Pages/Sakit";
import Ijin from "./Pages/Ijin";
import Pengaturan from "./Pages/Pengaturan";
import PresensiStaff from "./Pages/PresensiStaff";
import FaceVerification from "./Pages/FaceVerification";
import FaceCam from "./Pages/FaceCam";
import Errors from "./Pages/Error";

function App() {
	return (
		<Router>
			{window.screen.width > 500 ? (
				<div className="font-primary w-screen h-screen absolute left-0 top-0 z-50 flex justify-center items-center before:size-full before:bg-black before:opacity-40 backdrop-blur-sm before:absolute">
					<div className="modal-box">
						<h3 className="font-bold text-xl">Warning!</h3>
						<p className="py-4 text-lg">
							Harap gunakan Handphone agar dapat mengakses website
						</p>
					</div>
				</div>
			) : null}

			<Routes>
				<Route path="/" Component={Register} />
				<Route path="/verification" Component={OtpInput} />
				<Route path="/login" Component={Login} />
				<Route path="/password/reset" Component={ChangePassword} />
				<Route path="/home" Component={Home} />
				<Route path="/profile" Component={Profile} />
				<Route path="/presensi" Component={Presensi} />
				<Route path="/riwayat" Component={Riwayat} />
				<Route path="/bantuan" Component={Bantuan} />
				<Route path="/notifikasi" Component={Notification} />
				<Route path="/presensi/staff" Component={PresensiStaff} />
				<Route path="/presensi/verif" Component={FaceVerification} />
				<Route path="/presensi/bukti" Component={Sakit} />
				<Route path="/presensi/keterangan" Component={Ijin} />
				<Route path="/setting" Component={Pengaturan} />
				<Route path="/facecam" Component={FaceCam} />
				<Route path="*" Component={Errors} />
			</Routes>
		</Router>
	);
}

export default App;
