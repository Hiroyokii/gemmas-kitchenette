import type { Ingredient } from "./Ingredient";

export interface RecipeIngredient {
    id: number;
    foodId: number;
    ingredientId: number;
    quantity: number;
    ingredient: Ingredient;
}
