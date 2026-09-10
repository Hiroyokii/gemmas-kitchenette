import api from "../api/axios";
import type { Purchase } from "../types/Purchase";

export interface PurchaseItemInput {
    ingredientId: number;
    quantity: number;
    unitCost: number;
    expirationDate: string;
}

export type ExpirationStatus = "EXPIRED" | "EXPIRING_SOON";

export interface ExpirationAlert {
    id: number;
    ingredientName: string;
    remainingQuantity: number;
    unit: string;
    expirationDate: string;
    daysRemaining: number;
    status: ExpirationStatus;
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

export async function getExpirationAlerts(): Promise<ExpirationAlert[]> {
    const response = await api.get("/purchases/expiration-alerts");

    return response.data;
}
