import type { Request, Response } from "express";
import { createOrderService } from "../services/order.service.js";

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