import { useEffect, useState } from "react";

import { getTodaySalesReport } from "../../services/report.service";
import type { SalesReport } from "../../types/Report";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/admin/Alert";

export default function ReportsPage() {
    const [report, setReport] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadReport() {
        try {
            setLoading(true);

            const data = await getTodaySalesReport();

            setReport(data);
            setError("");
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load report."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReport();
    }, []);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reports</h1>

                <button
                    onClick={loadReport}
                    className="text-sm text-orange-600 hover:underline"
                >
                    Refresh
                </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                Currently shows today's sales only.
            </p>

            <Alert type="error" message={error} />

            {loading && <p>Loading...</p>}

            {!loading && report && <SalesSummary report={report} />}
        </div>
    );
}

export function SalesSummary({ report }: { report: SalesReport }) {
    const cards = [
        {
            label: "Total Orders",
            value: report.totalOrders,
        },
        {
            label: "Completed",
            value: report.completedOrders,
        },
        {
            label: "Cancelled",
            value: report.cancelledOrders,
        },
        {
            label: "Revenue",
            value: `₱${Number(report.totalRevenue).toFixed(2)}`,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="border rounded-lg p-4 bg-white"
                >
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
            ))}
        </div>
    );
}
