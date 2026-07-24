import api from "../api/axios";

export async function getTodayMenu() {
    const response = await api.get(
        "./daily-menu/today"
    );

    return response.data;
}