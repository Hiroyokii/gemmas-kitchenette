export interface Unit {
    id: number;
    name: string;
}

export interface Ingredient {
    id: number;
    name: string;
    unitId: number;
    unit?: Unit;
    minimumStock: number;
    costPerUnit: number;
    latestPurchaseUnitCost?: number | null;
    currentStock: number;
    isActive: boolean;
    expirationDate?: string | null;
    expirationStatus?: "SAFE" | "EXPIRING_SOON" | "EXPIRED" | null;
}
