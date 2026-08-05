import { z } from "zod";

export const ingredientSchema = z.object({
    name: z.string().trim().min(1, "Ingredient name is required."),

    unitId: z.coerce
        .number()
        .int()
        .positive("Unit is required."),

    minimumStock: z.coerce
        .number()
        .nonnegative("Minimum stock can't be negative."),

    costPerUnit: z.coerce
        .number()
        .nonnegative("Cost can't be negative."),
});

export type IngredientFormInput = z.input<typeof ingredientSchema>;
export type IngredientForm = z.output<typeof ingredientSchema>;  
