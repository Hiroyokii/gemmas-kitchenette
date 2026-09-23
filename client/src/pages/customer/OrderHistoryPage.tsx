import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getMyOrders } from "../../services/order.service";
import type { Order } from "../../types/Order";
import { getErrorMessage } from "../../utils/getErrorMessage";

import OrderTicket from "../../components/customer/OrderTicket";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";

const ACTIVE_ORDER_STATUSES = new Set<Order["status"]>([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
]);

export default function OrderHistoryPage() {
    const ordersQuery = useQuery<Order[]>({
        queryKey: ["my-orders"],
        queryFn: getMyOrders,
        refetchOnWindowFocus: true,
        refetchInterval: (query) => (
            query.state.data?.some((order) =>
                ACTIVE_ORDER_STATUSES.has(order.status)
            )
                ? 7_500
                : false
        ),
    });

    const navigate = useNavigate();
    const orders = ordersQuery.data ?? [];
    const loading = ordersQuery.isPending;

    return (
        <div className="space-y-10 pb-8">

            <Alert
                type="error"
                message={
                    ordersQuery.error
                        ? getErrorMessage(
                              ordersQuery.error,
                              "Failed to load your orders."
                          )
                        : ""
                }
            />

            {loading && (
                <div className="flex justify-center py-16">
                    <Spinner label="Loading your orders…" />
                </div>
            )}

            {!loading && !ordersQuery.error && orders.length === 0 && (
                <section>
                    <EmptyState
                        icon={
                            <Icon
                                name="ticket"
                                className="h-6 w-6"
                            />
                        }
                        title="No orders yet"
                        description="Once you place an order, it'll show up here with its status."
                        action={
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/")}
                            >
                                Browse the menu
                            </Button>
                        }
                    />
                </section>
            )}

            {!loading && !ordersQuery.error && orders.length > 0 && (
                <section>
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
                                Your orders
                            </p>

                            <div className="mt-1 flex items-center gap-3">
                                <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900">
                                    Order History
                                </h2>

                                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                                    {orders.length}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-stone-500">
                                View your recent orders and track their
                                progress.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 p-1 shadow-[0_8px_24px_rgba(41,37,36,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(41,37,36,0.1)]"
                            >
                                <OrderTicket order={order} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

