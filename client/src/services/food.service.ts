import api from "../api/axios";
import type { Food } from "../types/Food";

export interface FoodInput {
    name: string;
    description: string;
    price: number;
    categoryId: number;
    imageUrl?: string;
}

export interface UpdateFoodInput extends FoodInput {
    isAvailable: boolean;
}

export async function getFoods(params?: {
    search?: string;
    categoryId?: number;
}): Promise<Food[]> {
    const response = await api.get("/foods", { params });

    return response.data;
}

export async function createFood(data: FoodInput): Promise<Food> {
    const response = await api.post("/foods", data);

    return response.data;
}

export async function updateFood(
    id: number,
    data: UpdateFoodInput
): Promise<Food> {
    const response = await api.put(`/foods/${id}`, data);

    return response.data;
}
