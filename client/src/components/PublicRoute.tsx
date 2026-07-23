import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function PublicRoute() {
    const { user } = useAuth();

    if (user) {
        switch(user.role) {
            case "ADMIN":
            case "STAFF":
                return (
                    <Navigate
                        to="/admin"
                        replace
                    />
                );
            
            default:
                return (
                    <Navigate
                        to="/"
                        replace
                    />
                );
        }
    }

    return <Outlet />;
    
}