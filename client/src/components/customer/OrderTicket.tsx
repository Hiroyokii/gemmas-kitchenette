import type { Order } from "../../types/Order";
import Badge from "../ui/Badge";
import Icon from "../ui/Icon";
import { ORDER_STATUS_META } from "../../utils/orderStatus";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import ReviewModal from "./ReviewModal";

interface OrderTicketProps {
    order: Order;
}

export default function OrderTicket({ order }: OrderTicketProps) {
    const status = ORDER_STATUS_META[order.status];
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const reviewedItems = order.orderItems.filter((item) => item.review).length;
    const isCompleted = order.status === "COMPLETED";
    const hasUnreviewedItems = reviewedItems < order.orderItems.length;


    return (
        <div className=" ticket flex flex-col md:flex-row">
            <div className="ticket-stub flex shrink-0 flex-row items-center justify-between gap-3 bg-ink-50/60 px-4 py-3 md:w-28 md:flex-col md:justify-center md:gap-1 md:py-4">
                <span className="flex items-center gap-1.5 text-md font-medium uppercase tracking-wide text-ink-400 md:flex-col md:gap-0.5">
                    <Icon name="ticket" className="h-3.5 w-3.5 md:hidden" />
                    Order
                </span>
                <span className="font-display text-lg font-semibold text-ink-900">
                    #{order.id}
                </span>
            </div>

            <div className="flex-1 p-4 md:p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link
                            to={`/orders/${order.id}/status`}
                            className="inline-flex text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
                        >
                            View Order <Icon name="chevronRight" className="ml-1 h-4 w-4" />
                        </Link>

                        {isCompleted && (hasUnreviewedItems ? (
                            <Button type="button" size="sm" onClick={() => setIsReviewModalOpen(true)}>
                                {reviewedItems === 0 ? "Rate Your Order" : `Continue Reviewing (${reviewedItems}/${order.orderItems.length})`}
                            </Button>
                        ) : (
                            <span className="text-sm font-medium text-emerald-700">✓ Reviewed</span>
                        ))}
                    </div>
                    <Badge tone="custom" className={status.badgeClassName}>
                        {status.label}
                    </Badge>
                </div>

                <ul className="space-y-1 font-display text-md text-ink-700 py-2">
                    {order.orderItems.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between gap-3"
                        >
                            <span>
                                <span className="font-display text-ink-500">
                                    {item.quantity}×
                                </span>{" "}
                                {item.dailyMenu.food.name}
                            </span>
                            <span className="font-display text-ink-600">
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
                    <span className="font-display text-xl font-semibold text-ink-900">
                        ₱{Number(order.total).toFixed(2)}
                    </span>
                </div>

            </div>

            {isReviewModalOpen && (
                <ReviewModal order={order} onClose={() => setIsReviewModalOpen(false)} />
            )}
        </div>
    );
}
