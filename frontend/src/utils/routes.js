import AuthContainer from "../Pages/AuthContainer";
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
import Errors from "../Pages/Error";
import ProtectedRoute from "../Components/ProtectedRoute";

const isAuthenticated = !!localStorage.getItem("authToken");

export const routes = [
    // Rute untuk autentikasi
    { path: "/", component: <AuthContainer /> },
    { path: "/login", component: <AuthContainer /> },
    { path: "/register", component: <AuthContainer /> },
    { path: "/verify", component: <AuthContainer /> },
    { path: "/facereg", component: <AuthContainer /> },
    { path: "/recover", component: <AuthContainer /> },
    { path: "/setpassword", component: <AuthContainer /> },

    // Rute untuk halaman utama yang dilindungi
    { path: "/home", component: <ProtectedRoute component={Home} isAuthenticated={isAuthenticated} /> },
    { path: "/profile", component: <ProtectedRoute component={Profile} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi", component: <ProtectedRoute component={Presensi} isAuthenticated={isAuthenticated} /> },
    { path: "/riwayat", component: <ProtectedRoute component={Riwayat} isAuthenticated={isAuthenticated} /> },
    { path: "/bantuan", component: <ProtectedRoute component={Bantuan} isAuthenticated={isAuthenticated} /> },
    { path: "/notifikasi", component: <ProtectedRoute component={Notification} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi/staff", component: <ProtectedRoute component={PresensiStaff} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi/verif", component: <ProtectedRoute component={FaceVerification} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi/izin", component: <ProtectedRoute component={Izin} isAuthenticated={isAuthenticated} /> },
    { path: "/setting", component: <ProtectedRoute component={Pengaturan} isAuthenticated={isAuthenticated} /> },
    { path: "/facecam", component: <ProtectedRoute component={FaceCam} isAuthenticated={isAuthenticated} /> },

    // Fallback untuk rute tidak dikenal
    { path: "*", component: <Errors /> },
];
