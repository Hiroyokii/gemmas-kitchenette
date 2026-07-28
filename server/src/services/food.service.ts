import type { CreateFoodInput } from "../schemas/food.schema.js";

import {
    findFoodByName,
    findCategoryById,
    createFood,
    findFoods,
    findFoodById,
    updateFood
} from "../repositories/food.repository.js";

import { ConflictError } from "../errors/ConflictError.js";
import { NotFoundError } from "../errors/NotFoundError.js";


export async function createFoodService(
    data: CreateFoodInput
) {
    const existingFood = 
        await findFoodByName(data.name);

    if (existingFood) {
        throw new ConflictError(
            "Food already exists."
        );
    }

    const category = 
        await findCategoryById(
            data.categoryId
        );

    if (!category) {
        throw new NotFoundError(
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
        throw new NotFoundError(
            "Food not found."
        );
    }

    const category =
        await findCategoryById(
            data.categoryId
        );

    if (!category) {
        throw new NotFoundError(
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
        throw new ConflictError(
            "Food already exists."
        );
    }

    return updateFood(
        foodId,
        data
    );

}