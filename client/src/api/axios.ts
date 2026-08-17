import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

interface RefreshResponse {
    token: string;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise: Promise<string | null> | null = null;
let isRedirectingToLogin = false;

function isAuthEndpoint(url?: string): boolean {
    return Boolean(
        url?.includes("/auth/login") ||
        url?.includes("/auth/register") ||
        url?.includes("/auth/refresh")
    );
}

function redirectToLogin(): void {
    if (isRedirectingToLogin || window.location.pathname === "/login") {
        return;
    }

    isRedirectingToLogin = true;
    window.location.assign("/login");
}

function clearSession(): void {
    clearAccessToken();
}

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token && !config.url?.includes("/auth/refresh")) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        const status = error.response?.status;
        const url = originalRequest?.url;

        if (status !== 401 || !originalRequest || isAuthEndpoint(url)) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            clearSession();
            redirectToLogin();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!refreshPromise) {
            refreshPromise = api
                .post<RefreshResponse>("/auth/refresh")
                .then(({ data }) => {
                    setAccessToken(data.token);
                    return data.token;
                })
                .catch(() => {
                    clearSession();
                    redirectToLogin();
                    return null;
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        const newToken = await refreshPromise;

        if (!newToken) {
            return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api.request(originalRequest);
    }
);

export default api;
