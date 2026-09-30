import { Router } from "express";

import { createPurchase, getExpirationAlerts, getPurchases } from "../controllers/purchase.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createPurchaseSchema } from "../schemas/purchase.schema.js";

const router = Router();

router.get(
    "/expiration-alerts",
    authenticate,
    authorize("ADMIN"),
    getExpirationAlerts
);

router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    getPurchases
)

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createPurchaseSchema),
    createPurchase
)

export default router;
