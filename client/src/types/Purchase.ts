import type { Ingredient } from "./Ingredient";

export interface PurchaseItem {
    id: number;
    ingredientId: number;
    quantity: number;
    unitCost: number;
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