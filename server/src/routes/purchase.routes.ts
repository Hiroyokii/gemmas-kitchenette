import { Router } from "express";

import { createPurchase, getPurchases } from "../controllers/purchase.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createPurchaseSchema } from "../schemas/purchase.schema.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    getPurchases
)

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    validate(createPurchaseSchema),
    createPurchase
)

export default router;