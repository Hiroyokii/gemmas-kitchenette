import { Router } from "express";

import { createOrder, getMyOrders, updateOrderStatus, getAllOrders } from "../controllers/order.controller.js";
import { updateOrderStatusSchema } from "../schemas/orderStatus.schema.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createOrderSchema } from "../schemas/order.schema.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    getAllOrders
);

router.get(
    "/my",
    authenticate,
    authorize("CUSTOMER"),
    getMyOrders
);

router.post(
    "/",
    authenticate,
    authorize("CUSTOMER"),
    validate(createOrderSchema),
    createOrder
)

router.patch(
    "/:id/status",
    authenticate,
    authorize("ADMIN", "STAFF"),
    validate(updateOrderStatusSchema),
    updateOrderStatus
)

export default router;