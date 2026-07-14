import type { Request, Response } from "express";
import { createOrderService } from "../services/order.service.js";
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