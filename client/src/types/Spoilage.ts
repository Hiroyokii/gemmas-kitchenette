export interface SpoilageRecord {
  id: number;
  ingredientId: number;
  quantity: number;
  unitCost: number;
  reason: string;
  notes?: string | null;
  createdAt: string;
  ingredient: {
    id: number;
    name: string;
    unit?: {
      name: string;
    };
  };
  recordedBy?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateSpoilageInput {
  ingredientId: number;
  quantity: number;
  reason: string;
  notes?: string;
}