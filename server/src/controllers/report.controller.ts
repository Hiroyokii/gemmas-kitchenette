import { getTodaySalesReportService } from "../services/report.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTodaySalesReport = asyncHandler(async (_, res) => {
    const report = await getTodaySalesReportService();

    res.json(report);
});