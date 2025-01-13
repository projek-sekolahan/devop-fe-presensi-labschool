import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import OtpInput from "./OtpInput";
import RegisterFace from "./RegisterFace";
import ChangePassword from "./ChangePassword";
import SetPassword from "./SetPassword";

export default function AuthContainer() {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState("login"); // Default halaman
    const [isOpen, setIsOpen] = useState(false); // Status form

    const toggleForm = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen); // Toggle status form
    };

    useEffect(() => {
        const pageMap = {
            "/register": "register",
            "/verify": "verify",
            "/facereg": "facereg",
            "/recover": "recover",
            "/setpassword": "setpassword",
        };
        setCurrentPage(pageMap[location.pathname] || "login");

        const validPaths = ["/", "/register", "/verify", "/facereg", "/recover", "/setpassword"];
        if (!validPaths.includes(location.pathname)) {
            navigate("/");
        }
    }, [location.pathname, navigate]);

    const handleNavigate = (page) => {
        toggleForm(); // Tutup form saat navigasi ke halaman lain
        navigate(page === "login" ? "/" : `/${page}`);
    };

    const renderPage = () => {
        const pageMap = {
            login: <Login isOpen={isOpen} onToggle={handleNavigate} />,
            register: <Register isOpen={isOpen} onToggle={handleNavigate} />,
            verify: <OtpInput onBack={() => handleNavigate("login")} />,
            facereg: <RegisterFace onBack={() => handleNavigate("login")} />,
            recover: <ChangePassword onBack={() => handleNavigate("login")} />,
            setpassword: <SetPassword onBack={() => handleNavigate("login")} />,
        };
        return pageMap[currentPage] || pageMap.login;
    };

    return (
        <div className="auth-container">
            {renderPage()}
        </div>
    );
}