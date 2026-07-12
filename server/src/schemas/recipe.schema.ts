import { z } from "zod";

export const recipeIngredientSchema = z.object({
    ingredientId: z.number().int().positive(),

    quantity: z.number().positive(),
});

export const createRecipeSchema = z.object({
    ingredients: z
        .array(recipeIngredientSchema)
        .min(1, "Recipe must contain at least one ingredient."),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;