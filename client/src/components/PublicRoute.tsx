import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function PublicRoute() {
    const { user } = useAuth();

    if (user) {
        const destination = user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/";

        return <Navigate to={destination} replace />;
    }

    return <Outlet />;
}
