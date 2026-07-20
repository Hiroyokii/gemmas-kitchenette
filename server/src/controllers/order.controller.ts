import { OrderStatus } from "../generated/prisma/index.js";
import type { PaginationInput } from "../schemas/pagination.schema.js";
import {
    createOrderService,
    getMyOrdersService,
    getAllOrdersService,
    updateOrderStatusService,
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

    res.json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await getMyOrdersService(
        req.user!.userId
    );

    res.json(orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
    const { page, limit } =
        req.query as unknown as PaginationInput;

    const orders = await getAllOrdersService(
        page,
        limit
    );

    res.json(orders);
});