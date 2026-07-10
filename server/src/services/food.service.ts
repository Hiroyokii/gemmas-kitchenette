import type { CreateFoodInput } from "../schemas/food.schema.js";

import {
    findFoodByName,
    findCategoryById,
    createFood,
} from "../repositories/food.repository.js";


export async function createFoodService(
    data: CreateFoodInput
) {
    const existingFood = 
        await findFoodByName(data.name);

    if (existingFood) {
        throw new Error(
            "Food already exists."
        );
    }

    const category = 
        await findCategoryById(
            data.categoryId
        );

    if (!category) {
        throw new Error(
            "Category not found."
        );
    }

    return createFood(data)
}