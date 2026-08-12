import { useEffect, useState } from "react";

import { getMyOrders } from "../../services/order.service";
import type { Order, OrderStatus } from "../../types/Order";
import { getErrorMessage } from "../../utils/getErrorMessage";

const STATUS_STYLES: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PREPARING: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-200 text-gray-600",
};

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getMyOrders()
            .then(setOrders)
            .catch((err) =>
                setError(getErrorMessage(err, "Failed to load your orders."))
            )
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p>Loading your orders...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (orders.length === 0) {
        return <p>You haven't placed any orders yet.</p>;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">My Orders</h1>

            {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-semibold">Order #{order.id}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                        >
                            {order.status.replace(/_/g, " ")}
                        </span>
                    </div>

                    <div className="text-sm space-y-1 mb-2">
                        {order.orderItems.map((item) => (
                            <p key={item.id}>
                                {item.quantity}x {item.dailyMenu.food.name}
                                {" — "}₱{(item.price * item.quantity).toFixed(2)}
                            </p>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500 mb-1">
                        Delivering to: {order.deliveryAddress}
                    </p>

                    <p className="text-right font-semibold">
                        Total: ₱{Number(order.total).toFixed(2)}
                    </p>
                </div>
            ))}
        </div>
    );
}
