import { Router } from "express";

import { 
    createDailyMenu,
    getTodayMenu,
    getTodayMenuForAdmin
} from "../controllers/dailyMenu.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createDailyMenuSchema } from "../schemas/dailyMenu.schema.js";

const router = Router();

router.get(
    "/today",
    getTodayMenu
)

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    getTodayMenuForAdmin
)

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createDailyMenuSchema),
    createDailyMenu
)

export default router;