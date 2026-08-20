import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { User } from "../types/User";

import {
    logout as logoutRequest,
    refreshSession,
} from "../services/auth.service";

import {
    clearAccessToken,
    setAccessToken,
} from "../api/tokenStore";

import {
    AuthContext,
    type AuthContextValue,
} from "../contexts/AuthContext";

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = useCallback(
        (nextToken: string, nextUser: User) => {
            setAccessToken(nextToken);
            setToken(nextToken);
            setUser(nextUser);
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } finally {
            clearAccessToken();
            setToken(null);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function restoreSession() {
            try {
                const response = await refreshSession();

                if (!cancelled) {
                    login(response.token, response.user);
                }
            } catch {
                if (!cancelled) {
                    clearAccessToken();
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        restoreSession();

        return () => {
            cancelled = true;
        };
    }, [login]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            isLoading,
            login,
            logout,
        }),
        [user, token, isLoading, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}