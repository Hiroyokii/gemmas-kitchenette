import type { CreateFoodInput } from "../schemas/food.schema.js";

import {
    findFoodByName,
    findCategoryById,
    createFood,
    findFoods,
    findFoodById,
    updateFood
} from "../repositories/food.repository.js";
import { AppError } from "../errors/AppError.js";


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

export async function getFoodsService(
    search?: string,
    categoryId?: number
) {
    return findFoods(
        search,
        categoryId
    );
}

export async function updateFoodService(
    foodId: number,
    data: CreateFoodInput
) {

    const food =
        await findFoodById(foodId);

    if (!food) {
        throw new AppError(
            404,
            "Food not found."
        );
    }

    const category =
        await findCategoryById(
            data.categoryId
        );

    if (!category) {
        throw new AppError(
            404,
            "Category not found."
        );
    }

    const existingFood =
        await findFoodByName(
            data.name
        );

    if (
        existingFood &&
        existingFood.id !== foodId
    ) {
        throw new AppError(
            409,
            "Food already exists."
        );
    }

    return updateFood(
        foodId,
        data
    );

}