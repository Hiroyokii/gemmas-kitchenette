import api from "../api/axios";
import type { RecipeIngredient } from "../types/Recipe";

export interface RecipeInput {
    ingredients: {
        ingredientId: number;
        quantity: number;
    }[];
}

export async function getRecipe(
    foodId: number
): Promise<RecipeIngredient[]> {
    const response = await api.get(`/recipes/${foodId}`);

    return response.data;
}

export async function updateRecipe(
    foodId: number,
    data: RecipeInput
): Promise<RecipeIngredient[]> {
    const response = await api.put(`/recipes/${foodId}`, data);

    return response.data;
}