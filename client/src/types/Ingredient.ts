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
    currentStock: number;
    isActive: boolean;
}