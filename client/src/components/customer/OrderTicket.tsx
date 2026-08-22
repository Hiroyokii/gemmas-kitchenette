import type { Order } from "../../types/Order";
import Badge from "../ui/Badge";
import Icon from "../ui/Icon";
import { ORDER_STATUS_META } from "../../utils/orderStatus";

interface OrderTicketProps {
    order: Order;
}

export default function OrderTicket({ order }: OrderTicketProps) {
    const status = ORDER_STATUS_META[order.status];

    return (
        <div className="ticket flex flex-col sm:flex-row">
            <div className="ticket-stub flex shrink-0 flex-row items-center justify-between gap-3 bg-ink-50/60 px-4 py-3 sm:w-28 sm:flex-col sm:justify-center sm:gap-1 sm:py-4">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-400 sm:flex-col sm:gap-0.5">
                    <Icon name="ticket" className="h-3.5 w-3.5 sm:hidden" />
                    Order
                </span>
                <span className="font-mono text-lg font-semibold text-ink-900">
                    #{order.id}
                </span>
            </div>

            <div className="flex-1 p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-ink-400">
                        <Icon name="clock" className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleString()}
                    </span>

                    <Badge tone={status.tone}>{status.label}</Badge>
                </div>

                <ul className="space-y-1 text-sm text-ink-700">
                    {order.orderItems.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between gap-3"
                        >
                            <span>
                                <span className="font-mono text-ink-500">
                                    {item.quantity}×
                                </span>{" "}
                                {item.dailyMenu.food.name}
                            </span>
                            <span className="font-mono text-ink-600">
                                ₱{(item.price * item.quantity).toFixed(2)}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="mt-3 flex items-start gap-1.5 text-xs text-ink-400">
                    <Icon name="mapPin" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {order.deliveryAddress}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink-200 pt-3">
                    <span className="text-sm font-medium text-ink-600">Total</span>
                    <span className="font-mono text-lg font-semibold text-ink-900">
                        ₱{Number(order.total).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}
