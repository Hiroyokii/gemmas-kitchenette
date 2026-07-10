import { Request, Response } from "express";

import { createFoodService } from "../services/food.service.js";
import { createFoodSchema } from "../schemas/food.schema.js";

export async function createFood(
    req: Request,
    res: Response,
) {
    try {
        const data = createFoodSchema.parse(req.body);
        const food = await createFoodService(data);

        res.status(201).json(food)
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}