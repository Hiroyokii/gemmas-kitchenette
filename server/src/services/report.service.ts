import { getTodaySalesReport } from "../repositories/report.repository.js";
import { getManilaDayStart, getNextManilaDayStart } from "../utils/manilaDay.js";

export async function getTodaySalesReportService() {
    const start = getManilaDayStart();
    const end = getNextManilaDayStart(start);

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
