import { create } from "node:domain";
import { z } from "zod";

export const createIngredientSchema = z.object({
    name: z.string().trim().min(1),

    unitId: z.number().int().positive(),

    minimumStock: z.number().nonnegative(),

    costPerUnit: z.number().nonnegative(),

});

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;

export const updateIngredientSchema = 
    createIngredientSchema;