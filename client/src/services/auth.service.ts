import api from "../api/axios";

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    firstName: string;
    lastName: string;
    middleName?: string;
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