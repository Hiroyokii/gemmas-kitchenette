import { Router } from "express";

import { createDailyMenu } from "../controllers/dailyMenu.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createDailyMenuSchema } from "../schemas/dailyMenu.schema.js";

const router = Router();

router.post(
    "/daily-menu",
    authenticate,
    authorize("ADMIN"),
    validate(createDailyMenuSchema),
    createDailyMenu
)

export default router;