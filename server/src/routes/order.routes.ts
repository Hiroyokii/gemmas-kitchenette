import { Router } from "express";

import { 
    createOrder, 
    getOrderByIdForCustomer,
    getMyOrders, 
    updateOrderStatus, 
    getAllOrders, 
    submitPaymentProof,
    getPaymentProof,
    verifyPayment, 
    rejectPayment,
    cancelMyOrder,
} from "../controllers/order.controller.js";
import { updateOrderStatusSchema } from "../schemas/orderStatus.schema.js";
import { paginationSchema } from "../schemas/pagination.schema.js";
import { rejectPaymentSchema } from "../schemas/payment.schema.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { 
    createOrderSchema, 
    paymentProofSchema,
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

router.get(
    "/:id",
    authenticate,
    authorize("CUSTOMER"),
    getOrderByIdForCustomer
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
    "/:id/cancel",
    authenticate,
    authorize("CUSTOMER"),
    cancelMyOrder,
);

router.patch(
    "/:id/payment/proof",
    authenticate, 
    authorize("CUSTOMER"), 
    validate(paymentProofSchema),
    submitPaymentProof
);

router.get(
    "/:id/payment/proof",
    authenticate,
    authorize("CUSTOMER", "ADMIN", "STAFF"),
    getPaymentProof,
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
