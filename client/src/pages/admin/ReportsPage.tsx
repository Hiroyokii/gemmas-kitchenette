import { useQuery } from "@tanstack/react-query";

import { getTodaySalesReport } from "../../services/report.service";

import type { SalesReport } from "../../types/Report";

import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/ui/Alert";

export default function ReportsPage() {
    const {
        data: report,
        isPending,
        isFetching,
        error,
        refetch,
    } = useQuery<SalesReport>({
        queryKey: ["reports", "today-sales"],
        queryFn: getTodaySalesReport,
    });

    const errorMessage = error
        ? getErrorMessage(error, "Failed to load report.")
        : "";

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Reports
                </h1>

                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="text-sm text-orange-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isFetching ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <p className="mb-6 text-sm text-gray-500">
                Currently shows today's sales only.
            </p>

            <Alert
                type="error"
                message={errorMessage}
            />

            {isPending && (
                <p className="text-sm text-stone-500">
                    Loading...
                </p>
            )}

            {report && (
                <SalesSummary report={report} />
            )}
        </div>
    );
}

export function SalesSummary({
    report,
}: {
    report: SalesReport;
}) {
    const cards = [
        {
            label: "Total Orders",
            value: report.totalOrders,
            image: "../../public/orders.png",
        },
        {
            label: "Completed",
            value: report.completedOrders,
            image: "../../public/completed.png",
        },
        {
            label: "Cancelled",
            value: report.cancelledOrders,
            image: "../../public/cancelled.png",
        },
        {
            label: "Revenue",
            value: `₱${Number(report.totalRevenue).toFixed(2)}`,
            image: "../../public/revenue.png",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-4"
                >
                    <div className="relative z-10">
                        <p className="text-xs text-stone-500">
                            {card.label}
                        </p>

                        <p className="mt-1 text-2xl font-bold text-stone-900">
                            {card.value}
                        </p>
                    </div>

                    <img
                        src={card.image}
                        alt=""
                        className="pointer-events-none absolute -bottom-9 -right-4 h-28 w-28 object-contain opacity-[0.08]"
                    />
                </div>
            ))}
        </div>
    );
}