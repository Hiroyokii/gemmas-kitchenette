import { OrderStatus } from "../generated/prisma/index.js";
import type { PaginationInput } from "../schemas/pagination.schema.js";
import {
    createOrderService,
    getOrderByIdForCustomerService,
    getMyOrdersService,
    getAllOrdersService,
    updateOrderStatusService,
    submitPaymentProofService,
    getPaymentProofService,
    verifyPaymentService,
    rejectPaymentService,
} from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
    const order = await createOrderService(
        req.user!.userId,
        req.body
    );

    res.status(201).json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await updateOrderStatusService(
        Number(req.params.id),
        req.body.status as OrderStatus
    );

    res.status(200).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await getMyOrdersService(
        req.user!.userId
    );

    res.status(200).json(orders);
});

export const getOrderByIdForCustomer = asyncHandler(async (req, res) => {
    const order = await getOrderByIdForCustomerService(
        Number(req.params.id),
        req.user!.userId
    );

    res.status(200).json(order);
});

export const getAllOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const date = typeof req.query.date === "string" ? req.query.date : undefined;

    const orders = await getAllOrdersService(
        page,
        limit,
        date,
    );

    res.status(200).json(orders);
});

export const submitPaymentProof = asyncHandler(async (req, res) => {
    const order = await submitPaymentProofService(
        Number(req.params.id), 
        req.user!.userId, 
        req.body.screenshotDataUrl,
    );

    res.status(200).json(order);
});

export const getPaymentProof = asyncHandler(async (req, res) => {
    const screenshotDataUrl = await getPaymentProofService(
        Number(req.params.id),
        req.user!.userId,
        req.user!.role,
    );
    res.status(200).json({ screenshotDataUrl });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const order = await verifyPaymentService(
        Number(req.params.id), 
        req.user!.userId
    );

    res.status(200).json(order);
});


export const rejectPayment = asyncHandler(async (req, res) => {
    const order = await rejectPaymentService(
        Number(req.params.id), 
        req.body.reason
    );

    res.status(200).json(order);
});
