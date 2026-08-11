import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { getTodaySalesReport } from "../../services/report.service";
import type { SalesReport } from "../../types/Report";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/admin/Alert";
import { SalesSummary } from "./ReportsPage";

const QUICK_LINKS = [
    { to: "/admin/menu", label: "Prepare today's menu" },
    { to: "/admin/orders", label: "Manage orders" },
    { to: "/admin/purchases", label: "Record a purchase" },
    { to: "/admin/foods", label: "Manage foods" },
];

export default function DashboardPage() {
    const { user } = useAuth();

    const [report, setReport] = useState<SalesReport | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getTodaySalesReport()
            .then(setReport)
            .catch((err) =>
                setError(getErrorMessage(err, "Failed to load report."))
            );
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">
                Welcome, {user?.firstName}
            </h1>
            <p className="text-gray-500 mb-6">Here's today at a glance.</p>

            <Alert type="error" message={error} />

            {report && <SalesSummary report={report} />}

            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
                <div className="flex flex-wrap gap-3">
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="rounded border px-4 py-2 text-sm hover:bg-orange-50"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
