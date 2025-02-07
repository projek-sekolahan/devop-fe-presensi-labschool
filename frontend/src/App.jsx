import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loading from "./Components/Loading";
import { routes } from "./Components/routes";
import { isMobile } from "react-device-detect";
import DesktopWarning from "./Components/DesktopWarning";
import "./App.css";

function App() {
    const [isRestricted, setIsRestricted] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsRestricted(window.innerWidth > 800);
        };

        handleResize(); // Set initial state
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return (
        <Router>
            {(isRestricted || !isMobile) && <DesktopWarning />}
            <Suspense fallback={<Loading />}>
                <Routes>
                    {routes.map(({ path, element }, index) => (
                        <Route key={index} path={path} element={element} />
                    ))}
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;