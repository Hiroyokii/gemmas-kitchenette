import type { Request, Response } from "express";
import { createOrderService, getMyOrdersService } from "../services/order.service.js";
import { updateOrderStatusService } from "../services/order.service.js";
import { OrderStatus } from "../generated/prisma/index.js";


export async function createOrder(
    req: Request,
    res: Response
) {
    const order = await createOrderService(
        req.user!.userId,
        req.body
    );

    res.status(201).json(order);
}

export async function updateOrderStatus(
    req: Request,
    res: Response
) {
    const order = await updateOrderStatusService(
        Number(req.params.id),
        req.body.status as OrderStatus
    );

    res.json(order);
}

export async function getMyOrders(
    req: Request,
    res: Response
) {
    const orders =
        await getMyOrdersService(
            req.user!.userId
        );

    res.json(orders);
}