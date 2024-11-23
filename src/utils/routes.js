import Register from "../Pages/Register";
import OtpInput from "../Pages/OtpInput";
import RegisterFace from "../Pages/RegisterFace";
import Login from "../Pages/Login";
import ChangePassword from "../Pages/ChangePassword";
import Home from "../Pages/Home";
import Profile from "../Pages/Profile";
import Presensi from "../Pages/Presensi";
import Riwayat from "../Pages/Riwayat";
import Bantuan from "../Pages/Bantuan";
import Notification from "../Pages/Notification";
import PresensiStaff from "../Pages/PresensiStaff";
import FaceVerification from "../Pages/FaceVerification";
import Izin from "../Pages/Izin";
import Pengaturan from "../Pages/Pengaturan";
import FaceCam from "../Pages/FaceCam";
import SetPassword from "../Pages/SetPassword";
import Errors from "../Pages/Error";

export const routes = [
  { path: "/register", component: Register },
  { path: "/verify", component: OtpInput },
  { path: "/facereg", component: RegisterFace },
  { path: "/login", component: Login },
  { path: "/recover", component: ChangePassword },
  { path: "/home", component: Home },
  { path: "/profile", component: Profile },
  { path: "/presensi", component: Presensi },
  { path: "/riwayat", component: Riwayat },
  { path: "/bantuan", component: Bantuan },
  { path: "/notifikasi", component: Notification },
  { path: "/presensi/staff", component: PresensiStaff },
  { path: "/presensi/verif", component: FaceVerification },
  { path: "/presensi/izin", component: Izin },
  { path: "/setting", component: Pengaturan },
  { path: "/facecam", component: FaceCam },
  { path: "/setpassword", component: SetPassword },
  { path: "*", component: Errors },
];
