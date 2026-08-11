import api from "../api/axios";
import type { SalesReport } from "../types/Report";

export async function getTodaySalesReport(): Promise<SalesReport> {
    const response = await api.get("/reports/sales/today");

    return response.data;
}