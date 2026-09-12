import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { getOrderById } from "../../services/order.service";
import type { Order, OrderStatus } from "../../types/Order";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { ORDER_STATUS_META } from "../../utils/orderStatus";

import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";

const TIMELINE_STEPS: { status: Exclude<OrderStatus, "CANCELLED">; label: string }[] = [
    { status: "PENDING", label: "Received" },
    { status: "CONFIRMED", label: "Confirmed" },
    { status: "PREPARING", label: "Preparing" },
    { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
    { status: "COMPLETED", label: "Completed" },
];

const STATUS_MESSAGES: Record<OrderStatus, string> = {
    PENDING: "We received your order and will confirm it shortly.",
    CONFIRMED: "Your order is confirmed and queued for the kitchen.",
    PREPARING: "Our kitchen is preparing your food fresh for you.",
    OUT_FOR_DELIVERY: "Your order is on the way to your delivery address.",
    COMPLETED: "Your order has been completed. Thank you for choosing Gemma's Kitchenette!",
    CANCELLED: "This order has been cancelled. Please contact the store if you need assistance.",
};

function formatDate(date: string) {
    return new Date(date).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatPrice(value: number) {
    return `₱${Number(value).toFixed(2)}`;
}

function OrderTimeline({ order }: { order: Order }) {
    if (order.status === "CANCELLED") {
        return (
            <Card className="border-red-200 bg-red-50/50 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <Icon name="warning" className="h-5 w-5" />
                    </span>
                    <div>
                        <Badge tone="red">Cancelled</Badge>
                        <h2 className="mt-2 font-display text-xl font-semibold text-ink-900">Order cancelled</h2>
                        <p className="mt-1 text-sm leading-6 text-ink-600">{STATUS_MESSAGES.CANCELLED}</p>
                        {order.cancelledAt && (
                            <p className="mt-2 text-sm font-medium text-ink-700">
                                Cancelled on {formatDate(order.cancelledAt)}
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    const currentIndex = TIMELINE_STEPS.findIndex((step) => step.status === order.status);

    return (
        <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-display text-xl font-semibold text-ink-900">Order status</h2>
                    <p className="mt-1 text-sm text-ink-600">{STATUS_MESSAGES[order.status]}</p>
                    {order.status === "COMPLETED" && order.completedAt && (
                        <p className="mt-2 text-sm font-medium text-ink-700">
                            Completed on {formatDate(order.completedAt)}
                        </p>
                    )}
                </div>
                <Badge tone={ORDER_STATUS_META[order.status].tone}>{ORDER_STATUS_META[order.status].label}</Badge>
            </div>

            <ol className="mt-6 grid grid-cols-5 gap-1 sm:gap-2" aria-label="Order progress">
                {TIMELINE_STEPS.map((step, index) => {
                    const isCurrent = index === currentIndex;
                    const isComplete = index < currentIndex || order.status === "COMPLETED" && index === currentIndex;

                    return (
                        <li key={step.status} className="relative min-w-0 text-center">
                            {index > 0 && (
                                <span
                                    className={`absolute right-1/2 top-4 h-0.5 w-full ${index <= currentIndex ? "bg-orange-400" : "bg-stone-200"}`}
                                    aria-hidden="true"
                                />
                            )}
                            <span
                                className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                                    isCurrent
                                        ? "border-orange-500 bg-orange-500 text-white"
                                        : isComplete
                                            ? "border-orange-400 bg-orange-50 text-orange-600"
                                            : "border-stone-200 bg-white text-stone-400"
                                }`}
                            >
                                {isComplete ? <Icon name="check" className="h-4 w-4" /> : index + 1}
                            </span>
                            <span className={`mt-2 block text-[10px] font-medium leading-3 sm:text-xs ${isCurrent ? "text-orange-700" : isComplete ? "text-ink-700" : "text-stone-400"}`}>
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </Card>
    );
}

function OrderSummary({ order }: { order: Order }) {
    const subtotal = order.orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const deliveryFee = Number(order.total) - subtotal;

    return (
        <Card className="p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Order summary</h2>
            <ul className="mt-4 space-y-3">
                {order.orderItems.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
                        <div>
                            <p className="font-medium text-ink-800">{item.dailyMenu.food.name}</p>
                            <p className="mt-0.5 text-ink-500">{item.quantity} × {formatPrice(Number(item.price))}</p>
                        </div>
                        <span className="shrink-0 font-mono text-ink-700">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
                <div className="flex justify-between text-ink-600"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-ink-600"><span>Delivery fee</span><span className="font-mono">{formatPrice(deliveryFee)}</span></div>
                <div className="flex justify-between pt-2 text-base font-semibold text-ink-900"><span>Total</span><span className="font-mono">{formatPrice(Number(order.total))}</span></div>
            </div>
        </Card>
    );
}

function DeliveryInformation({ order }: { order: Order }) {
    const customerName = `${order.customer.firstName} ${order.customer.lastName}`;

    return (
        <Card className="p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Delivery information</h2>
            <dl className="mt-4 space-y-4 text-sm">
                <div><dt className="text-ink-500">Fulfilment</dt><dd className="mt-1 font-medium text-ink-800">Delivery</dd></div>
                <div><dt className="text-ink-500">Delivery address</dt><dd className="mt-1 flex gap-2 font-medium leading-5 text-ink-800"><Icon name="mapPin" className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />{order.deliveryAddress}</dd></div>
                <div><dt className="text-ink-500">Customer</dt><dd className="mt-1 font-medium text-ink-800">{customerName}</dd>{order.customer.phoneNumber && <dd className="mt-0.5 text-ink-600">{order.customer.phoneNumber}</dd>}{order.customer.email && <dd className="mt-0.5 text-ink-600">{order.customer.email}</dd>}</div>
            </dl>
        </Card>
    );
}

function PaymentInformation({ order }: { order: Order }) {
    const payment = order.payment;
    const isGcash = payment?.method === "GCASH";

    return (
        <Card className="p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Payment information</h2>
            {!payment ? (
                <p className="mt-4 text-sm text-ink-500">Payment information is unavailable for this order.</p>
            ) : (
                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><span className="text-ink-600">Method</span><span className="font-medium text-ink-800">{isGcash ? "GCash (simulated)" : "Cash on Delivery"}</span></div>
                    {isGcash && <div className="flex items-center justify-between gap-3"><span className="text-ink-600">Verification</span><Badge tone={payment.status === "VERIFIED" ? "leaf" : payment.status === "REJECTED" ? "red" : "gold"}>{payment.status.replace(/_/g, " ")}</Badge></div>}
                    {isGcash && payment.verifiedAt && <p className="text-ink-600">Verified on {formatDate(payment.verifiedAt)}</p>}
                    {isGcash && payment.rejectionReason && <p className="rounded-lg bg-red-50 p-3 text-red-700">{payment.rejectionReason}</p>}
                    {!isGcash && <p className="text-ink-600">Pay when your order arrives.</p>}
                </div>
            )}
        </Card>
    );
}

function NeedHelp() {
    return (
        <Card className="p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Need help?</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">Please reach out to Gemma's Kitchenette if you have questions about your order.</p>
            <p className="mt-3 text-sm font-medium text-ink-700">Home-cooked, block by block.</p>
        </Card>
    );
}

export default function OrderStatusPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const parsedOrderId = Number(orderId);
    const hasValidOrderId = Number.isInteger(parsedOrderId) && parsedOrderId > 0;
    const orderQuery = useQuery({
        queryKey: ["order", parsedOrderId],
        queryFn: () => getOrderById(parsedOrderId),
        enabled: hasValidOrderId,
    });

    if (!hasValidOrderId) {
        return <div className="-mx-6 -my-6 min-h-full bg-stone-50 p-6"><EmptyState icon={<Icon name="ticket" className="h-6 w-6" />} title="Order not found" description="This order link is invalid." action={<Button variant="secondary" onClick={() => navigate("/orders")}>Back to Orders</Button>} /></div>;
    }

    if (orderQuery.isPending) {
        return <div className="-mx-6 -my-6 flex min-h-full justify-center bg-stone-50 p-6 py-16"><Spinner label="Loading order status…" /></div>;
    }

    if (orderQuery.error || !orderQuery.data) {
        return (
            <div className="-mx-6 -my-6 min-h-full bg-stone-50 p-6">
                <PageHeader title="Order status" />
                <Alert type="error" message={getErrorMessage(orderQuery.error, "We couldn't load this order. It may no longer be available.")} />
                <div className="mt-6"><Button variant="secondary" onClick={() => navigate("/orders")}>Back to Orders</Button></div>
            </div>
        );
    }

    const order = orderQuery.data;

    return (
        <div className="-mx-6 -my-6 min-h-full bg-stone-50 p-6">
            <PageHeader title={`Order #${order.id}`} description={`Placed ${formatDate(order.createdAt)}`} />
            <Card className="mb-6 border-orange-100 bg-orange-50/50 p-5 sm:p-6"><p className="font-display text-xl font-semibold text-ink-900">Thank you for your order!</p><p className="mt-1 text-sm text-ink-600">We’ll keep this page updated as your order moves along.</p></Card>
            <OrderTimeline order={order} />
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <OrderSummary order={order} />
                <div className="space-y-6"><DeliveryInformation order={order} /><PaymentInformation order={order} /><NeedHelp /></div>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="secondary" onClick={() => navigate("/orders")}>Back to Orders</Button>
                <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-2.5 text-center text-sm text-stone-500" aria-label="Reviews coming soon">Review your order — coming soon</div>
            </div>
        </div>
    );
}
