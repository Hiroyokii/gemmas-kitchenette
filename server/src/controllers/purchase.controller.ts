import { createPurchaseService, getPurchasesServices } from "../services/purchase.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPurchase = asyncHandler(async (req, res) => {
    const purchase = await createPurchaseService(
        req.body,
        req.user!.userId
    );

    res.status(201).json(purchase);
});

export const getPurchases = asyncHandler(async (_, res) => {
    const purchase =
        await getPurchasesServices();

    res.status(200).json(purchase);
})