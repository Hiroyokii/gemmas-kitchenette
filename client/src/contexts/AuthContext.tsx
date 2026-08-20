import { createContext } from "react";
import type { User } from "../types/User";

export interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => Promise<void>;
}

export const AuthContext =
    createContext<AuthContextValue | undefined>(undefined);