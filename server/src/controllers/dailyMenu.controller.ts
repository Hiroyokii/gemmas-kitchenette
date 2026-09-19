import { 
    getTodayMenuService, 
    prepareDailyFood,
    getTodayMenuForAdminService,
} from "../services/dailyMenu.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createDailyMenu = asyncHandler(async (req, res) => {
    const dailyMenu = await prepareDailyFood(req.body);

    res.status(201).json(dailyMenu);
});

export const getTodayMenu = asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;
    const categoryId = req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined;

    const menu = await getTodayMenuService(search, categoryId);

    res.status(200).json(menu);
});

export const getTodayMenuForAdmin = asyncHandler(async (_, res) => {
    const menu = await getTodayMenuForAdminService();

    res.json(menu);
});
