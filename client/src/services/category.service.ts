import api from "../api/axios";
import type { Category } from "../types/Food";

export async function getCategories(): Promise<Category[]> {
    const response = await api.get("/categories");

    return response.data;
}