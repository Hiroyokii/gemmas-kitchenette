import { asyncHandler } from "../utils/asyncHandler.js";
import { getAvailableBatchesService, getSpoilageRecordsService, recordSpoilageService } from "../services/spoilage.service.js";

export const getSpoilageRecords = asyncHandler(async (_req, res) => {
    res.json(await getSpoilageRecordsService());
});

export const getAvailableBatches = asyncHandler(async (_req, res) => {
    res.json(await getAvailableBatchesService());
});

export const createSpoilage = asyncHandler(async (req, res) => {
    res.status(201).json(await recordSpoilageService(req.body, req.user!.userId));
});
