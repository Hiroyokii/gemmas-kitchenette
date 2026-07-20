import { createFoodService, getFoodsService } from "../services/food.service.js";
import { createFoodSchema } from "../schemas/food.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createFood = asyncHandler(async (req, res) => {
    const data = createFoodSchema.parse(req.body);
    const food = await createFoodService(data);

    res.status(201).json(food);
});

export const getFoods = asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;

    const categoryId = req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined;

    const foods = await getFoodsService(
        search,
        categoryId
    );

    res.json(foods);
});