import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,

    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    const isRefreshRequest = config.url?.includes("/auth/refresh");

    if (token && !isRefreshRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let refreshPromise: Promise<string | null> | null = null;

function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthEndpoint =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh");

        if (
            error.response?.status !== 401 ||
            isAuthEndpoint ||
            originalRequest._retried
        ) {
            if (error.response?.status === 401 && !isAuthEndpoint) {
                clearSession();

                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }

            return Promise.reject(error);
        }

        originalRequest._retried = true;

        if (!refreshPromise) {
            refreshPromise = api
                .post("/auth/refresh")
                .then((res) => {
                    const { token, user } = res.data;

                    localStorage.setItem("token", token);
                    localStorage.setItem("user", JSON.stringify(user));

                    return token as string;
                })
                .catch(() => {
                    clearSession();

                    if (window.location.pathname !== "/login") {
                        window.location.href = "/login";
                    }

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

        return api(originalRequest);
    }
);

export default api;