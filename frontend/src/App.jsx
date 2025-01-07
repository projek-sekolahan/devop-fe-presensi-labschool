import { useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import Loading from "./Components/Loading";
import { routes } from "./utils/routes";
import apiXML from "./utils/apiXML";
import { isMobile } from "react-device-detect";
import DesktopWarning from "./Components/DesktopWarning";
import "./App.css";

function App() {
    useEffect(() => {

        // Memeriksa dan menetapkan cookie
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
                expires: 1, // Expire dalam 1 hari
                secure: true,
                sameSite: "Strict",
            });
        }
    }, []);

    return (
        <Router>
            {!isMobile && <DesktopWarning />}
            <Suspense fallback={<Loading />}>
                <Routes>
                    {routes.map(({ path, component: Component }, index) => (
                        <Route
                            key={index}
                            path={path}
                            element={<Component />}
                        />
                    ))}
                </Routes>
            </Suspense>
        </Router>
    );
}
export default App;