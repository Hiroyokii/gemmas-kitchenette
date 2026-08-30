import { createSpoilageService, getSpoilageRecordsService } from "../services/spoilage.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSpoilageRecords = asyncHandler(async(_, res) => {
    const spoilage = await getSpoilageRecordsService();

    res.status(200).json(spoilage);
})

export const createSpoilage = asyncHandler(async(req, res) => {
    const spoilage = await createSpoilageService(
        req.user!.userId, 
        req.body
    );

    res.status(201).json(spoilage);
})