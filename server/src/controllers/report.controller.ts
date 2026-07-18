import type {
    Request,
    Response
} from "express";

import {
    getTodaySalesReportService
} from "../services/report.service.js";

export async function getTodaySalesReport(
    req: Request,
    res: Response
) {
    const report =
        await getTodaySalesReportService();

    res.json(report);
}