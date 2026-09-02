import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { getTodaySalesReport } from "../../services/report.service";
import type { SalesReport } from "../../types/Report";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/ui/Alert";
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
        <div className="min-h-full bg-stone-50 px-4 py-6 sm:px-6 sm:py-8"> 
            <div className="mx-auto w-full max-w-7xl"> 
                {/* Header */} 
                <div className="mb-6"> 
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900"> 
                        Welcome, {user?.firstName} 
                    </h1> 
                        
                    <p className="mt-2 text-sm leading-6 text-stone-500"> 
                        Here's today at a glance. 
                    </p> 
                </div> 
                
                {/* Error */} 
                <Alert type="error" message={error} /> 
                
                {/* Sales Summary */} 
                {report && ( 
                    <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-6"> 
                        <div className="mb-5"> 
                            <h2 className="text-lg font-semibold text-stone-900"> 
                                Today's sales 
                            </h2> 
                            
                            <p className="mt-1 text-sm text-stone-500"> 
                                A quick overview of your sales performance today. 
                            </p> 
                        </div> 
                        
                        <SalesSummary report={report} />   
                    </div> 
                )} 
                
                {/* Quick Actions */} 
                <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-6"> 
                    <div className="mb-5"> 
                        <h2 className="text-lg font-semibold text-stone-900"> 
                            Quick actions 
                        </h2> 
                        
                        <p className="mt-1 text-sm text-stone-500"> 
                            Common tasks you can access quickly. 
                        </p> 
                    </div> 
                    
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"> 
                        {QUICK_LINKS.map((link) => ( 
                            <Link 
                                key={link.to} 
                                to={link.to} 
                                className="rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100" > 
                                    {link.label} 
                            </Link> 
                        ))} 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
}
