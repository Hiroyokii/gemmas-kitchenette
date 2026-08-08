import { useEffect, useState } from "react";

import { getAllOrders, updateOrderStatus } from "../../services/order.service";
import type { Order, OrderStatus, PaginationMeta } from "../../types/Order";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/admin/Alert";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING"],
    PREPARING: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
};

const STATUS_STYLES: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PREPARING: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-200 text-gray-600",
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(
        null
    );
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [actionError, setActionError] = useState("");

    async function loadOrders() {
        try {
            setLoading(true);

            const data = await getAllOrders(page, 10);

            setOrders(data.orders);
            setPagination(data.pagination);
            setLoadError("");
        } catch (error) {
            setLoadError(getErrorMessage(error, "Failed to load orders."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, [page]);

    async function handleStatusChange(
        orderId: number,
        status: OrderStatus
    ) {
        setActionError("");
        setUpdatingId(orderId);

        try {
            const updated = await updateOrderStatus(orderId, status);

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? updated : order
                )
            );
        } catch (error) {
            setActionError(
                getErrorMessage(error, "Failed to update order status.")
            );
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Orders</h1>

            <Alert type="error" message={loadError} />
            <Alert type="error" message={actionError} />

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Placed</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td className="p-3" colSpan={7}>
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && orders.length === 0 && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={7}>
                                    No orders yet.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            orders.map((order) => {
                                const nextStatuses =
                                    ALLOWED_TRANSITIONS[order.status];

                                return (
                                    <tr key={order.id} className="border-t align-top">
                                        <td className="p-3">#{order.id}</td>
                                        <td className="p-3">
                                            {order.customer.firstName}{" "}
                                            {order.customer.lastName}
                                        </td>
                                        <td className="p-3">
                                            {order.orderItems.map((item) => (
                                                <div key={item.id}>
                                                    {item.quantity}x{" "}
                                                    {item.dailyMenu.food.name}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="p-3">
                                            ₱{Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                                            >
                                                {order.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs text-gray-500">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString()}
                                        </td>
                                        <td className="p-3">
                                            {nextStatuses.length > 0 ? (
                                                <select
                                                    disabled={
                                                        updatingId === order.id
                                                    }
                                                    value=""
                                                    onChange={(e) =>
                                                        e.target.value &&
                                                        handleStatusChange(
                                                            order.id,
                                                            e.target
                                                                .value as OrderStatus
                                                        )
                                                    }
                                                    className="border rounded p-1 text-xs"
                                                >
                                                    <option value="">
                                                        Change to...
                                                    </option>
                                                    {nextStatuses.map(
                                                        (status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status.replace(
                                                                    /_/g,
                                                                    " "
                                                                )}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
