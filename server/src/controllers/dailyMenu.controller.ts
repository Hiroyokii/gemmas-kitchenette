import type { Request, Response } from "express";

import { prepareDailyFood } from "../services/dailyMenu.service.js";

export async function createDailyMenu(
    req: Request,
    res: Response
) {
    const dailyMenu = await prepareDailyFood(
        req.body
    );

    res.status(201).json(dailyMenu);
}