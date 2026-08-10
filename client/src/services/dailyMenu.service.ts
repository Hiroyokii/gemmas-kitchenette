import api from "../api/axios";
import type { DailyMenu } from "../types/DailyMenu";

export async function getTodayMenu(): Promise<DailyMenu[]> {
    const response = await api.get(
        "/daily-menu/today"
    );

    return response.data;
}

export async function getTodayMenuForAdmin(): Promise<DailyMenu[]> {
    const response = await api.get("/daily-menu");

    return response.data;
}

export interface PrepareFoodInput {
    foodId: number;
    preparedServings: number;
}

export async function prepareDailyFood(
    data: PrepareFoodInput
): Promise<DailyMenu> {
    const response = await api.post("/daily-menu", data);

    return response.data;
}