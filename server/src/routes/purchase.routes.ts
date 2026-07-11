import { Router } from "express";

import { createPurchase } from "../controllers/purchase.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createPurchaseSchema } from "../schemas/purchase.schema.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    validate(createPurchaseSchema),
    createPurchase
)

export default router;