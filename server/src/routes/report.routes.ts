import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

import {
    getTodaySalesReport
} from "../controllers/report.controller.js";

const router = Router();

router.get(
    "/sales/today",
    authenticate,
    authorize("ADMIN"),
    getTodaySalesReport
);

export default router;