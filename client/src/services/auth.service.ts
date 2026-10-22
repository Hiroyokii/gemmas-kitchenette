import api from "../api/axios";
import type { User } from "../types/User";

export interface UpdateProfileInput {
    firstName: string;
    lastName: string;
    block: string;
    lot: string;
    street: string;
    landmark: string | null;
}

export async function getMyProfile() {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data.user;
}

export async function updateMyProfile(data: UpdateProfileInput) {
    const response = await api.put<{ user: User }>("/auth/profile", data);
    return response.data.user;
}

export async function changeMyPassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.put<{ message: string }>("/auth/password", data);
    return response.data;
}

export async function updateMyAvatar(file: File) {
    const response = await api.put<{ user: User }>("/auth/avatar", file, {
        headers: { "Content-Type": file.type },
    });
    return response.data.user;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    block: string;
    lot: string;
    street: string;
    landmark?: string;
}

export async function login(
    data: LoginInput
) {
    const response =
        await api.post(
            "/auth/login",
            data
        );

    return response.data;
}

export async function register(
    data: RegisterInput
) {
    const response = 
        await api.post(
            "/auth/register",
            data
        );
    
    return response.data;
}

export async function refreshSession() {
    const response = 
        await api.post(
            "/auth/refresh"
        );
    
    return response.data;
}

export async function logout() {
    const response =
        await api.post(
            "/auth/logout"
        );
    
    return response.data;
}
