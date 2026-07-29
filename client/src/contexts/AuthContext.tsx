import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import type { User } from "../types/User";
import { refreshSession, logout as logoutRequest } from "../services/auth.service";


interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;

    login: (
        token: string,
        user: User
    ) => void;

    logout: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined> (
    undefined
);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] =
        useState<User | null>(null);

    const [token, setToken] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] = 
        useState(true);
    

    useEffect(() => {
        async function restoreSession() {
            try {
                const response = await refreshSession();

                login(response.token, response.user);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                setIsLoading(false);
            }
        }

        restoreSession();
    }, []); 

    function login(
        token: string,
        user: User
    ) {
        localStorage.setItem(
            "token",
            token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        setToken(token);
        setUser(user);
    }

    async function logout() {
        try {
            await logoutRequest();
        } catch {

        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider."
        );
    }

    return context;
}


