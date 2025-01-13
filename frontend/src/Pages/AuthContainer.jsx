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

    // Tentukan halaman mana yang terbuka berdasarkan path
    useEffect(() => {
        switch (location.pathname) {
            case "/register":
                setCurrentPage("register");
                break;
            case "/verify":
                setCurrentPage("verify");
                break;
            case "/facereg":
                setCurrentPage("facereg");
                break;
            case "/recover":
                setCurrentPage("recover");
                break;
            case "/setpassword":
                setCurrentPage("setpassword");
                break;
            default:
                setCurrentPage("login");
        }
    }, [location.pathname]);

    const handleNavigate = (page) => {
        switch (page) {
            case "login":
                navigate("/");
                break;
            case "register":
                navigate("/register");
                break;
            case "verify":
                navigate("/verify");
                break;
            case "facereg":
                navigate("/facereg");
                break;
            case "recover":
                navigate("/recover");
                break;
            case "setpassword":
                navigate("/setpassword");
                break;
            default:
                navigate("/");
        }
    };

    // Render komponen berdasarkan halaman aktif
    const renderPage = () => {
        switch (currentPage) {
            case "login":
                return <Login isOpen={true} onToggle={() => handleNavigate("register")} />;
            case "register":
                return <Register isOpen={true} onToggle={() => handleNavigate("login")} />;
            case "verify":
                return <OtpInput onBack={() => handleNavigate("login")} />;
            case "facereg":
                return <RegisterFace onBack={() => handleNavigate("login")} />;
            case "recover":
                return <ChangePassword onBack={() => handleNavigate("login")} />;
            case "setpassword":
                return <SetPassword onBack={() => handleNavigate("login")} />;
            default:
                return <Login isOpen={true} onToggle={() => handleNavigate("register")} />;
        }
    };

    return <div className="auth-container">{renderPage()}</div>;
}
