import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Register from "./Pages/Register";
import EmailVerif from "./Pages/EmailVerif";
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

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" Component={Register} />
				<Route path="/verification" Component={EmailVerif} />
				<Route path="/login" Component={Login} />
				<Route path="/password/reset" Component={ChangePassword} />
				<Route path="/home" Component={Home} />
				<Route path="/profile" Component={Profile} />
				<Route path="/presensi" Component={Presensi} />
				<Route path="/riwayat" Component={Riwayat} />
				<Route path="/bantuan" Component={Bantuan} />
				<Route path="/notifikasi" Component={Notification} />
				<Route path="/presensi/staff" Component={PresensiStaff} />
				<Route path="/presensi/masuk" Component={FaceVerification} />
				<Route path="/presensi/sakit" Component={Sakit} />
				<Route path="/presensi/ijin" Component={Ijin} />
				<Route path="/setting" Component={Pengaturan} />

			</Routes>
		</Router>
	);
}

export default App;
