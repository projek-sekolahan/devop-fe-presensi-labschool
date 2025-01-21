import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Loading from "./Components/Loading";
import { routes } from "./Components/routes";
import { isMobile } from "react-device-detect";
import DesktopWarning from "./Components/DesktopWarning";
import "./App.css";

function App() {

    return (
        <Router>
            {!isMobile && <DesktopWarning />}
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