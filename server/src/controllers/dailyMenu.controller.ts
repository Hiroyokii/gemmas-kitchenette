import { getTodayMenuService, prepareDailyFood } from "../services/dailyMenu.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createDailyMenu = asyncHandler(async (req, res) => {
    const dailyMenu = await prepareDailyFood(req.body);

    res.status(201).json(dailyMenu);
});

export const getTodayMenu = asyncHandler(async (_, res) => {
    const menu = await getTodayMenuService();

    res.json(menu);
});