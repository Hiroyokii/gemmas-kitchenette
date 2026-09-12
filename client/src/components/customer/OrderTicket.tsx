import type { Order } from "../../types/Order";
import Badge from "../ui/Badge";
import Icon from "../ui/Icon";
import { ORDER_STATUS_META } from "../../utils/orderStatus";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { submitPaymentReference } from "../../services/order.service";
import { Link } from "react-router-dom";

interface OrderTicketProps {
    order: Order;
}

export default function OrderTicket({ order }: OrderTicketProps) {
    const status = ORDER_STATUS_META[order.status];
    const queryClient = useQueryClient();
    const [referenceNumber, setReferenceNumber] = useState("");
    const referenceMutation = useMutation({
        mutationFn: () => submitPaymentReference(order.id, referenceNumber.trim()),
        onSuccess: () => {
            setReferenceNumber("");
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        },
    });

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

                {order.payment && (
                    <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
                        <span className="font-semibold text-ink-800">{order.payment.method === "GCASH" ? "GCash (simulated)" : "Cash on Delivery"}</span>
                        <span className="mx-1">·</span>
                        <span>{order.payment.status.replace(/_/g, " ")}</span>
                        {order.payment.referenceNumber && <p className="mt-1 font-mono">Reference: {order.payment.referenceNumber}</p>}
                        {order.payment.rejectionReason && <p className="mt-1 text-red-600">{order.payment.rejectionReason}</p>}
                        {order.payment.method === "GCASH" && order.status === "PENDING" && order.payment.status !== "VERIFIED" && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                <input value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} placeholder="Submit a corrected reference" className="min-w-0 flex-1 rounded border border-stone-200 bg-white px-2 py-1" />
                                <button type="button" disabled={referenceNumber.trim().length < 4 || referenceMutation.isPending} onClick={() => referenceMutation.mutate()} className="rounded bg-brand-500 px-2 py-1 font-medium text-white disabled:opacity-50">{referenceMutation.isPending ? "Sending…" : "Submit"}</button>
                            </div>
                        )}
                        {referenceMutation.error && <p className="mt-2 text-red-600">Could not submit the reference. Please check it and try again.</p>}
                    </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink-200 pt-3">
                    <span className="text-sm font-medium text-ink-600">Total</span>
                    <span className="font-mono text-lg font-semibold text-ink-900">
                        ₱{Number(order.total).toFixed(2)}
                    </span>
                </div>

                <Link
                    to={`/orders/${order.id}/status`}
                    className="mt-3 inline-flex text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
                >
                    Track order <Icon name="chevronRight" className="ml-1 h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
