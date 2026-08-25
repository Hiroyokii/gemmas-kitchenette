import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrders } from "../../services/order.service";
import type { Order } from "../../types/Order";
import { getErrorMessage } from "../../utils/getErrorMessage";

import OrderTicket from "../../components/customer/OrderTicket";
import PageHeader from "../../components/ui/PageHeader";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getMyOrders()
            .then(setOrders)
            .catch((err) => setError(getErrorMessage(err, "Failed to load your orders.")))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <PageHeader title="My Orders" />

            <Alert type="error" message={error} />

            {loading && (
                <div className="flex justify-center py-16">
                    <Spinner label="Loading your orders…" />
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <EmptyState
                    icon={<Icon name="ticket" className="h-6 w-6" />}
                    title="No orders yet"
                    description="Once you place an order, it'll show up here with its status."
                    action={
                        <Button variant="secondary" onClick={() => navigate("/")}>
                            Browse the menu
                        </Button>
                    }
                />
            )}

            {!loading && orders.length > 0 && (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderTicket key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
