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

// Fungsi untuk mengecek autentikasi
const isAuthenticated = !!localStorage.getItem("login_token");

export const routes = [
    { path: "/", element: <AuthContainer /> },
    { path: "/login", element: <AuthContainer /> },
    { path: "/register", element: <AuthContainer /> },
    { path: "/verify", element: <AuthContainer /> },
    { path: "/facereg", element: <AuthContainer /> },
    { path: "/recover", element: <AuthContainer /> },
    { path: "/setpassword", element: <AuthContainer /> },

    // Rute yang dilindungi
    { path: "/home", element: <ProtectedRoute component={Home} isAuthenticated={isAuthenticated} /> },
    { path: "/profile", element: <ProtectedRoute component={Profile} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi", element: <ProtectedRoute component={Presensi} isAuthenticated={isAuthenticated} /> },
    { path: "/riwayat", element: <ProtectedRoute component={Riwayat} isAuthenticated={isAuthenticated} /> },
    { path: "/bantuan", element: <ProtectedRoute component={Bantuan} isAuthenticated={isAuthenticated} /> },
    { path: "/notifikasi", element: <ProtectedRoute component={Notification} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi/staff", element: <ProtectedRoute component={PresensiStaff} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi/verif", element: <ProtectedRoute component={FaceVerification} isAuthenticated={isAuthenticated} /> },
    { path: "/presensi/izin", element: <ProtectedRoute component={Izin} isAuthenticated={isAuthenticated} /> },
    { path: "/setting", element: <ProtectedRoute component={Pengaturan} isAuthenticated={isAuthenticated} /> },
    { path: "/facecam", element: <ProtectedRoute component={FaceCam} isAuthenticated={isAuthenticated} /> },

    // Fallback untuk rute tidak dikenal
    { path: "*", element: <Errors /> },
];
