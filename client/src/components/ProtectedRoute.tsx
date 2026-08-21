import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Spinner from "./ui/Spinner";
import type { User } from "../types/User";

interface ProtectedRouteProps {
    roles?: User["role"][];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner label="Checking your session…" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
