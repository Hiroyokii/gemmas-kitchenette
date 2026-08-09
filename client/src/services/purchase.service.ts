import api from "../api/axios";
import type { Purchase } from "../types/Purchase";

export interface PurchaseItemInput {
    ingredientId: number;
    quantity: number;
    unitCost: number;
}

export interface CreatePurchaseInput {
    items: PurchaseItemInput[];
}

export async function getPurchases(): Promise<Purchase[]> {
    const response = await api.get("/purchases");

    return response.data;
}

export async function createPurchase(
    data: CreatePurchaseInput
): Promise<Purchase> {
    const response = await api.post("/purchases", data);

    return response.data;
}