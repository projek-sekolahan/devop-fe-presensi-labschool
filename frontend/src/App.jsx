import { useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import Loading from "./Components/Loading";
import { routes } from "./utils/routes";
import { isMobile } from "react-device-detect";
import DesktopWarning from "./Components/DesktopWarning";
import "./App.css";

function App() {
    useEffect(() => {
        // Cache-Busting dengan Query String Unik
        const addCacheBusting = () => {
            const timestamp = new Date().getTime();
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach((link) => {
                const href = link.href.split('?')[0];
                link.href = `${href}?t=${timestamp}`;
            });
        };

        // Membersihkan Cookies dan Local Storage
        const clearCookiesAndStorage = () => {
            document.cookie.split(";").forEach((cookie) => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            });
            localStorage.clear();
            sessionStorage.clear();
        };

        // Minta Izin untuk Cookie
        const handleCookies = () => {
            if (!Cookies.get("cookiesAccepted")) {
                Swal.fire({
                    title: "Allow Cookies",
                    text: "Kami menggunakan cookie untuk meningkatkan pengalaman Anda.",
                    icon: "warning",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    allowEscapeKey: false,
                });
                Cookies.set("cookiesAccepted", "true", {
                    expires: 1,
                    secure: true,
                    sameSite: "Strict",
                });
            }
        };

        addCacheBusting();
        clearCookiesAndStorage();
        handleCookies();
    }, []);

    return (
        <Router>
            {/* !isMobile && <DesktopWarning /> */}
            <Suspense fallback={<Loading />}>
                <Routes>
                    {routes.map(({ path, component: Component }, index) => (
                        <Route key={index} path={path} element={<Component />} />
                    ))}
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;