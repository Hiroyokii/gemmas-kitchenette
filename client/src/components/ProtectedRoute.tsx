import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectRouteProps {
    roles?: (
        | "ADMIN"
        | "STAFF"
        | "CUSTOMER"
    )[];
}

export default function ProtectedRoute({
    roles,
}: ProtectRouteProps) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (
        roles &&
        !roles.includes(user.role)
    ) {
        return <Navigate to="/" replace />
    }

    return <Outlet/>
}
