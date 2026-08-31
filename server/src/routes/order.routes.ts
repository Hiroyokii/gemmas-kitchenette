import { Router } from "express";

import { 
    createOrder, 
    getMyOrders, 
    updateOrderStatus, 
    getAllOrders, 
    submitPaymentReference, 
    verifyPayment, 
    rejectPayment  
} from "../controllers/order.controller.js";
import { updateOrderStatusSchema } from "../schemas/orderStatus.schema.js";
import { paginationSchema } from "../schemas/pagination.schema.js";
import { rejectPaymentSchema } from "../schemas/payment.schema.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { 
    createOrderSchema, 
    referenceSchema 
} from "../schemas/order.schema.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    validate(
        paginationSchema,
        "query"
    ),
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

router.patch(
    "/:id/payment/reference", 
    authenticate, 
    authorize("CUSTOMER"), 
    validate(referenceSchema), 
    submitPaymentReference
);

router.patch(
    "/:id/payment/verify", 
    authenticate, 
    authorize("ADMIN", "STAFF"), 
    verifyPayment
);

router.patch(
    "/:id/payment/reject", 
    authenticate, 
    authorize("ADMIN", "STAFF"), 
    validate(rejectPaymentSchema), 
    rejectPayment
);

export default router;