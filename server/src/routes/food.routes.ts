import { Router } from "express";

import { createFood } from "../controllers/food.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";


const router = Router();

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createFood
)

export default router;