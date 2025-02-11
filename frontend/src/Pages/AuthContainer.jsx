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
    const [currentPage, setCurrentPage] = useState("login"); // Default halaman
    const [isOpen, setIsOpen] = useState(false); // Status form

    // Fungsi untuk toggle form tanpa merubah URL
    const toggleForm = (page = "login") => {
        setIsOpen((prevIsOpen) => !prevIsOpen); // Hanya toggle status form
        setCurrentPage(page); // Menentukan halaman mana yang ditampilkan
    };

    useEffect(() => {
        const pageMap = {
            "/register": "register",
            "/verify": "verify",
            "/facereg": "facereg",
            "/recover": "recover",
            "/setpassword": "setpassword",
        };
        if (location.pathname.startsWith("/kehadiran")) {
            setCurrentPage("kehadiran");
        } else {
            setCurrentPage(pageMap[location.pathname] || "login");
        }
        const validPaths = ["/", "/register", "/verify", "/facereg", "/recover", "/setpassword"];
        if (!validPaths.includes(location.pathname)) {
            navigate("/");
        }
    }, [location.pathname, navigate]);

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

    return (
        <div className="auth-container">
            {renderPage()}
        </div>
    );
}