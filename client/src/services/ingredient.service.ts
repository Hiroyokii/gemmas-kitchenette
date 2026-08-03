import api from "../api/axios";
import type { Ingredient, Unit } from "../types/Ingredient";

export interface IngredientInput {
    name: string;
    unitId: number;
    minimumStock: number;
    costPerUnit: number;
}

export async function getIngredients(): Promise<Ingredient[]> {
    const response = await api.get("/ingredients");

    return response.data;
}

export async function getUnits(): Promise<Unit[]> {
    const response = await api.get("/ingredients/units");

    return response.data;
}

export async function createIngredient(
    data: IngredientInput
): Promise<Ingredient> {
    const response = await api.post("/ingredients", data);

    return response.data;
}

export async function updateIngredient(
    id: number,
    data: IngredientInput
): Promise<Ingredient> {
    const response = await api.put(`/ingredients/${id}`, data);

    return response.data;
}
