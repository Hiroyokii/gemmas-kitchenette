import { Request, Response } from "express";

import { createPurchaseService } from "../services/purchase.service.js";

export async function createPurchase(
    req: Request,
    res: Response
) {
    const purchase = await createPurchaseService(
        req.body,
        req.user!.userId
    );

    res.status(201).json(purchase)
}