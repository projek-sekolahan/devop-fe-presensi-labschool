import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./Login";
import Register from "./Register";
import OtpInput from "./OtpInput";
import RegisterFace from "./RegisterFace";
import ChangePassword from "./ChangePassword";
import SetPassword from "./SetPassword";
import Kehadiran from "./Kehadiran";

export default function AuthContainer() {
    const location = useLocation();
    const navigate = useNavigate();

    // 🔹 Default halaman dan status form
    const [currentPage, setCurrentPage] = useState("login");
    const [isOpen, setIsOpen] = useState(false);

    // 🔹 Fungsi untuk toggle form login / register / recover
    const toggleForm = (page = "login") => {
        setIsOpen((prev) => !prev);
        setCurrentPage(page);
    };

    useEffect(() => {
        // Pemetaan antara path dan halaman
        const pageMap = {
            "/register": "register",
            "/verify": "verify",
            "/facereg": "facereg",
            "/recover": "recover",
            "/setpassword": "setpassword",
        };

        // Tentukan halaman berdasarkan path
        if (location.pathname.startsWith("/kehadiran")) {
            setCurrentPage("kehadiran");
        } else {
            setCurrentPage(pageMap[location.pathname] || "login");
        }

        // Validasi path agar tidak error
        const validPaths = [
            "/",
            "/login",
            "/register",
            "/verify",
            "/facereg",
            "/recover",
            "/setpassword",
            "/kehadiran",
        ];
        if (!validPaths.some((path) => location.pathname.startsWith(path))) {
            navigate("*");
        }

        // 🔹 Buka otomatis hanya untuk halaman login
        if (location.pathname === "/" || location.pathname === "/login") {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [location.pathname, navigate]);

    // 🔹 Render komponen berdasarkan halaman aktif
    const renderPage = () => {
        const pageMap = {
            login: <Login isOpen={isOpen} onToggle={toggleForm} />,
            register: <Register isOpen={true} onToggle={toggleForm} />,
            recover: <ChangePassword isOpen={true} onToggle={toggleForm} />,
            verify: <OtpInput isOpen={true} onToggle={toggleForm} />,
            facereg: <RegisterFace isOpen={true} onToggle={toggleForm} />,
            setpassword: <SetPassword isOpen={true} onToggle={toggleForm} />,
            kehadiran: <Kehadiran />,
        };

        return pageMap[currentPage] || pageMap.login;
    };

    return <div className="auth-container">{renderPage()}</div>;
}