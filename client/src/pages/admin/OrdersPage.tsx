import { useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getAllOrders,
    getPaymentProof,
    verifyPayment,
    rejectPayment,
    updateOrderStatus,
} from "../../services/order.service";

import type {
    Order,
    OrderStatus,
    PaginationMeta,
} from "../../types/Order";

import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING"],
    PREPARING: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
};

const STATUS_STYLES: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PREPARING: "bg-purple-50 text-purple-700 border-purple-200",
    OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border-indigo-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function OrdersPage() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState(getTodayInManila);
    const [actionError, setActionError] = useState("");
    const [rejectingOrderId, setRejectingOrderId] = useState<number | null>(
        null
    );
    const [rejectionReason, setRejectionReason] = useState("");
    const [paymentProofOrderId, setPaymentProofOrderId] = useState<
        number | null
    >(null);

    const ordersQuery = useQuery<{
        orders: Order[];
        pagination: PaginationMeta;
    }>({
        queryKey: ["orders", page, selectedDate],
        queryFn: () => getAllOrders(page, 10, selectedDate),
        refetchInterval: 15_000,
        refetchOnWindowFocus: true,
    });

    const paymentProofQuery = useQuery({
        queryKey: ["payment-proof", paymentProofOrderId],
        queryFn: () => getPaymentProof(paymentProofOrderId!),
        enabled: paymentProofOrderId !== null,
    });

    const paymentMutation = useMutation({
        mutationFn: ({
            orderId,
            action,
            reason,
        }: {
            orderId: number;
            action: "verify" | "reject";
            reason?: string;
        }) =>
            action === "verify"
                ? verifyPayment(orderId)
                : rejectPayment(orderId, reason!.trim()),

        onSuccess: () => {
            setActionError("");
            setRejectingOrderId(null);
            setRejectionReason("");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },

        onError: (error) =>
            setActionError(
                getErrorMessage(
                    error,
                    "Failed to update GCash payment."
                )
            ),
    });

    const updateMutation = useMutation({
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: number;
            status: OrderStatus;
        }) => updateOrderStatus(orderId, status),

        onSuccess: async (_order, variables) => {
            setActionError("");

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["orders"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["admin-dashboard-orders"],
                }),
                ...(variables.status === "CANCELLED"
                    ? [
                          queryClient.invalidateQueries({
                              queryKey: ["daily-menu"],
                          }),
                      ]
                    : []),
            ]);
        },

        onError: (error) => {
            setActionError(
                getErrorMessage(
                    error,
                    "Failed to update order status."
                )
            );
        },
    });

    const orders = ordersQuery.data?.orders ?? [];
    const pagination = ordersQuery.data?.pagination;

    const loading = ordersQuery.isPending;

    return (
        <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-ink-900">
                    Orders
                </h1>

                <p className="mt-1 text-sm text-ink-500">
                    Daily order numbers reset at midnight (Asia/Manila). Select
                    a date to review its orders.
                </p>

                <label className="mt-4 inline-flex items-center gap-3 text-sm font-medium text-ink-700">
                    Order date

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) => {
                            setSelectedDate(event.target.value);
                            setPage(1);
                        }}
                        className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-ink-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                </label>
            </div>

            {/* Errors */}
            {ordersQuery.error && (
                <div className="mb-5">
                    <Alert
                        type="error"
                        message={getErrorMessage(
                            ordersQuery.error,
                            "Failed to load orders."
                        )}
                    />
                </div>
            )}

            {actionError && (
                <div className="mb-5">
                    <Alert type="error" message={actionError} />
                </div>
            )}

            {/* Orders table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner label="Loading orders…" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-12">
                        <EmptyState
                            icon={
                                <Icon
                                    name="list"
                                    className="h-6 w-6"
                                />
                            }
                            title="No orders yet"
                            description="Customer orders will appear here once they are placed."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead>
                                <tr className="border-b border-stone-200 bg-stone-50">
                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Order
                                    </th>

                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Customer
                                    </th>

                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Items
                                    </th>

                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Total
                                    </th>

                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Payment
                                    </th>

                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Placed
                                    </th>

                                    <th className="px-5 py-3 text-left font-medium text-ink-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => {
                                    const nextStatuses =
                                        ALLOWED_TRANSITIONS[
                                            order.status
                                        ].filter(
                                            (nextStatus) =>
                                                nextStatus !== "CONFIRMED" ||
                                                order.payment?.method !==
                                                    "GCASH" ||
                                                order.payment.status ===
                                                    "VERIFIED"
                                        );

                                    const isUpdating =
                                        updateMutation.isPending &&
                                        updateMutation.variables?.orderId ===
                                            order.id;

                                    return (
                                        <tr
                                            key={order.id}
                                            className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60"
                                        >
                                            {/* Order */}
                                            <td className="px-5 py-4 align-top">
                                                <span className="font-semibold text-ink-900">
                                                    #{order.dailyOrderNumber}
                                                </span>

                                                <p className="mt-1 text-xs text-ink-500">
                                                    {order.orderType ===
                                                    "PICKUP"
                                                        ? "Pickup"
                                                        : "Delivery"}
                                                </p>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="font-medium text-ink-900">
                                                    {order.customer.firstName}{" "}
                                                    {order.customer.lastName}
                                                </div>

                                                <p className="mt-1 max-w-52 text-xs text-ink-500">
                                                    {order.deliveryAddress ??
                                                        (order.orderType ===
                                                        "PICKUP"
                                                            ? "Pickup"
                                                            : "Address unavailable")}
                                                </p>

                                                {order.notes && (
                                                    <p className="mt-2 max-w-52 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">
                                                        <span className="font-semibold">
                                                            Customer note:
                                                        </span>{" "}
                                                        {order.notes}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Items */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="space-y-1">
                                                    {order.orderItems.map(
                                                        (item) => (
                                                            <div
                                                                key={item.id}
                                                                className="text-ink-600"
                                                            >
                                                                <span className="font-medium text-ink-800">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    x
                                                                </span>{" "}
                                                                {
                                                                    item.dailyMenu
                                                                        .food
                                                                        .name
                                                                }
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </td>

                                            {/* Total */}
                                            <td className="px-5 py-4 align-top">
                                                <span className="font-semibold text-ink-900">
                                                    ₱
                                                    {Number(
                                                        order.total
                                                    ).toFixed(2)}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 align-top">
                                                <span
                                                    className={[
                                                        "inline-flex rounded-full border px-2.5 py-1",
                                                        "text-xs font-medium",
                                                        STATUS_STYLES[
                                                            order.status
                                                        ],
                                                    ].join(" ")}
                                                >
                                                    {order.status.replace(
                                                        /_/g,
                                                        " "
                                                    )}
                                                </span>
                                            </td>

                                            {/* Payment */}
                                            <td className="px-5 py-4 align-top">
                                                {order.payment ? (
                                                    <div className="space-y-1 text-xs">
                                                        <p className="font-medium text-ink-800">
                                                            {order.payment
                                                                .method ===
                                                            "GCASH"
                                                                ? "GCash (simulated)"
                                                                : "Cash on Delivery"}
                                                        </p>

                                                        <p
                                                            className={[
                                                                "font-semibold",
                                                                order.payment
                                                                    .status ===
                                                                "VERIFIED"
                                                                    ? "text-green-700"
                                                                    : order.payment
                                                                          .status ===
                                                                      "REJECTED"
                                                                    ? "text-red-700"
                                                                    : "text-yellow-700",
                                                            ].join(" ")}
                                                        >
                                                            {order.payment.status.replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </p>

                                                        {order.payment
                                                            .method === "GCASH" &&
                                                            order.payment
                                                                .proofSubmittedAt && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setPaymentProofOrderId(
                                                                            order.id
                                                                        )
                                                                    }
                                                                    className="text-left font-medium text-blue-700 underline"
                                                                >
                                                                    View payment
                                                                    screenshot
                                                                </button>
                                                            )}

                                                        {order.payment
                                                            .rejectionReason && (
                                                            <p className="max-w-44 text-red-600">
                                                                {
                                                                    order
                                                                        .payment
                                                                        .rejectionReason
                                                                }
                                                            </p>
                                                        )}

                                                        {order.payment
                                                            .method === "GCASH" &&
                                                            order.payment
                                                                .status ===
                                                                "PENDING" &&
                                                            order.payment
                                                                .proofSubmittedAt && (
                                                                <div className="flex gap-2 pt-1">
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            paymentMutation.isPending
                                                                        }
                                                                        onClick={() =>
                                                                            paymentMutation.mutate(
                                                                                {
                                                                                    orderId:
                                                                                        order.id,
                                                                                    action:
                                                                                        "verify",
                                                                                }
                                                                            )
                                                                        }
                                                                        className="rounded bg-green-600 px-2 py-1 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                                    >
                                                                        Verify
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            paymentMutation.isPending
                                                                        }
                                                                        onClick={() =>
                                                                            setRejectingOrderId(
                                                                                order.id
                                                                            )
                                                                        }
                                                                        className="rounded border border-red-200 px-2 py-1 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                    </div>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-4 align-top">
                                                <span className="whitespace-nowrap text-xs text-ink-500">
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="px-5 py-4 align-top">
                                                {nextStatuses.length > 0 ? (
                                                    <select
                                                        disabled={isUpdating}
                                                        value=""
                                                        onChange={(event) => {
                                                            if (
                                                                event.target
                                                                    .value
                                                            ) {
                                                                updateMutation.mutate(
                                                                    {
                                                                        orderId:
                                                                            order.id,
                                                                        status: event
                                                                            .target
                                                                            .value as OrderStatus,
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                        className="h-9 rounded-lg border border-stone-200 bg-white px-3 text-xs text-ink-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-ink-400"
                                                    >
                                                        <option value="">
                                                            {isUpdating
                                                                ? "Updating..."
                                                                : "Change status"}
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
                                                    <span className="text-xs text-ink-400">
                                                        No actions
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={page <= 1 || ordersQuery.isFetching}
                        onClick={() =>
                            setPage((current) => current - 1)
                        }
                    >
                        Previous
                    </Button>

                    <span className="text-sm text-ink-600">
                        Page{" "}
                        <span className="font-medium text-ink-900">
                            {pagination.page}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-ink-900">
                            {pagination.totalPages}
                        </span>
                    </span>

                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={
                            page >= pagination.totalPages ||
                            ordersQuery.isFetching
                        }
                        onClick={() =>
                            setPage((current) => current + 1)
                        }
                    >
                        Next
                    </Button>
                </div>
            )}

            {rejectingOrderId !== null && (
                <Modal
                    title="Reject simulated GCash payment"
                    onClose={() => {
                        setRejectingOrderId(null);
                        setRejectionReason("");
                    }}
                >
                    <div className="space-y-4">
                        <p className="text-sm text-ink-600">
                            Give the customer a short reason so they can submit
                            a corrected payment screenshot.
                        </p>

                        <Input
                            label="Rejection reason"
                            value={rejectionReason}
                            onChange={(event) =>
                                setRejectionReason(event.target.value)
                            }
                            placeholder="e.g. Reference number could not be verified"
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    setRejectingOrderId(null)
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                disabled={
                                    rejectionReason.trim().length < 2
                                }
                                isLoading={paymentMutation.isPending}
                                onClick={() =>
                                    paymentMutation.mutate({
                                        orderId: rejectingOrderId,
                                        action: "reject",
                                        reason: rejectionReason,
                                    })
                                }
                            >
                                Reject payment
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {paymentProofOrderId !== null && (
                <Modal
                    title={`Payment screenshot · Order #${
                        orders.find(
                            (order) => order.id === paymentProofOrderId
                        )?.dailyOrderNumber ?? paymentProofOrderId
                    }`}
                    onClose={() => setPaymentProofOrderId(null)}
                >
                    {paymentProofQuery.isPending ? (
                        <Spinner />
                    ) : paymentProofQuery.error ? (
                        <Alert
                            type="error"
                            message={getErrorMessage(
                                paymentProofQuery.error,
                                "Could not load payment screenshot."
                            )}
                        />
                    ) : paymentProofQuery.data ? (
                        <img
                            src={paymentProofQuery.data}
                            alt={`GCash payment proof for order ${paymentProofOrderId}`}
                            className="max-h-[70dvh] max-w-full rounded-lg object-contain"
                        />
                    ) : null}
                </Modal>
            )}
        </div>
    );
}

function getTodayInManila(): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const part = (type: "year" | "month" | "day") =>
        parts.find((value) => value.type === type)!.value;

    return `${part("year")}-${part("month")}-${part("day")}`;
}