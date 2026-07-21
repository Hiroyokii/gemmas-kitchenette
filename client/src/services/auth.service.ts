import api from "../api/axios";

export interface LoginInput {
    email: string;
    password: string;
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