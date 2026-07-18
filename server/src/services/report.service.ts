import { getTodaySalesReport } from "../repositories/report.repository.js";

export async function getTodaySalesReportService() {

    const start = new Date();

    start.setHours(0,0,0,0);

    const end = new Date(start);

    end.setDate(end.getDate() + 1);

    const {
        completedOrders,
        cancelledOrders
    } = await getTodaySalesReport(
        start,
        end
    );

    const totalRevenue =
        completedOrders.reduce(
            (sum, order) =>
                sum + Number(order.total),
            0
        );

    return {
        date: start,
        totalOrders:
            completedOrders.length +
            cancelledOrders,
        completedOrders:
            completedOrders.length,
        cancelledOrders,
        totalRevenue,
    };
}