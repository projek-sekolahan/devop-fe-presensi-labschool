import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ component: Component, isAuthenticated }) {
    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
}
