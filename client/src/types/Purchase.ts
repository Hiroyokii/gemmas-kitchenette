import type { Ingredient } from "./Ingredient";

export interface PurchaseItem {
    id: number;
    ingredientId: number;
    quantity: number;
    remainingQuantity: number;
    unitCost: number;
    expirationDate?: string | null;
    ingredient: Ingredient;
}

export interface Purchase {
    id: number;
    createdAt: string;
    totalCost: number;
    createdBy: {
        id: number;
        firstName: string;
        lastName: string;
    };
    purchaseItems: PurchaseItem[];
}
