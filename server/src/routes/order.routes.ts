import { Router } from "express";

import { createOrder } from "../controllers/order.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createOrderSchema } from "../schemas/order.schema.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("CUSTOMER"),
    validate(createOrderSchema),
    createOrder
)

export default router;