import {
    createContext,
    useContext,
    useState,
} from "react";

import type { User } from "../types/User";


interface AuthContextType {
    user: User | null;
    token: string | null;

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

    function login(
        token: string,
        user: User
    ) {
        setToken(token);
        setUser(user);
    }

    function logout() {
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
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


