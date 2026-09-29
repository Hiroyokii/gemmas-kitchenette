import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { cancelMyOrder, getOrderById } from "../../services/order.service";
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
import ReviewModal from "../../components/customer/ReviewModal";
import CancelOrderModal from "../../components/customer/CancelOrderModal";

// ==========================================
// CONSTANTS & HELPERS
// ==========================================

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

// ==========================================
// SUB-COMPONENTS
// ==========================================

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "CANCELLED") {
    return (
      <Card className="h-auto border-red-200 bg-red-50/50 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Icon name="warning" className="h-5 w-5" />
          </span>
          <div>
            <Badge tone="red">Cancelled</Badge>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink-900">
              Order cancelled
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-600">
              {STATUS_MESSAGES.CANCELLED}
            </p>
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
    <Card className="h-auto p-5 md:p-6 bg-white">
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
        <Badge
          tone="custom"
          className={ORDER_STATUS_META[order.status].badgeClassName}
        >
          {ORDER_STATUS_META[order.status].label}
        </Badge>
      </div>

      <ol className="mt-6 grid grid-cols-5 gap-1 md:gap-2" aria-label="Order progress">
        {TIMELINE_STEPS.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isComplete =
            index < currentIndex || (order.status === "COMPLETED" && index === currentIndex);

          return (
            <li key={step.status} className="relative min-w-0 text-center">
              {index > 0 && (
                <span
                  className={`absolute right-1/2 top-4 h-0.5 w-full ${
                    index <= currentIndex ? "bg-[#FFB800]" : "bg-stone-800/30"
                  }`}
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  isCurrent
                    ? "border-[#da9c00] bg-[#FFB800] text-white"
                    : isComplete
                      ? "border-[#FFB800] bg-white text-[#FFB800]"
                      : "border-stone-700/40 bg-white text-stone-700"
                }`}
              >
                {isComplete ? <Icon name="check" className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={`mt-2 block text-[10px] font-medium leading-3 md:text-xs ${
                  isCurrent
                    ? "text-[#da9c00]"
                    : isComplete
                      ? "text-[#da9c00]"
                    : "text-stone-800"
                }`}
              >
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
  return (
    <Card className="h-auto p-5">
      <h2 className="font-display text-lg font-semibold text-ink-900">Order summary</h2>
      <ul className="mt-4 space-y-3">
        {order.orderItems.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-ink-800">{item.dailyMenu.food.name}</p>
              <p className="mt-0.5 text-ink-500">
                {item.quantity} × {formatPrice(Number(item.price))}
              </p>
            </div>
            <span className="shrink-0 font-mono text-ink-700">
              {formatPrice(Number(item.price) * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
        <div className="flex justify-between pt-2 text-base font-semibold text-ink-900">
          <span>Total</span>
          <span className="font-mono">{formatPrice(Number(order.total))}</span>
        </div>
      </div>
    </Card>
  );
}

function DeliveryInformation({ order }: { order: Order }) {
  const customerName = `${order.customer.firstName} ${order.customer.lastName}`;

  return (
    <Card className="h-auto p-5">
      <h2 className="font-display text-lg font-semibold text-ink-900">Order fulfillment</h2>
      <dl className="mt-4 space-y-4 text-sm">
        <div><dt className="text-ink-500">Order type:</dt><dd className="mt-1 font-medium text-ink-800">{order.orderType === "PICKUP" ? "Pickup" : "Delivery"}</dd></div>
        {order.orderType === "DELIVERY" && <div>
          <dt className="text-ink-500">Delivery address:</dt>
          <dd className="mt-1 flex gap-2 font-medium leading-5 text-ink-800"><Icon name="mapPin" className="mt-0.5 h-4 w-4 shrink-0 text-[#da9c00]" />{order.deliveryAddress}</dd>
        </div>}
        {order.notes && <div><dt className="text-ink-500">Order notes:</dt><dd className="mt-1 font-medium text-ink-800">{order.notes}</dd></div>}
        <div>
          <dt className="text-ink-500">Customer:</dt>
          <dd className="mt-1 font-medium text-ink-800">{customerName}</dd>
          {order.customer.phoneNumber && (
            <dd className="mt-0.5 text-ink-600">{order.customer.phoneNumber}</dd>
          )}
          {order.customer.email && (
            <dd className="mt-0.5 text-ink-600">{order.customer.email}</dd>
          )}
        </div>
      </dl>
    </Card>
  );
}

function PaymentInformation({ order }: { order: Order }) {
  const payment = order.payment;
  const isGcash = payment?.method === "GCASH";

  return (
    <Card className="h-auto p-5">
      <h2 className="font-display text-lg font-semibold text-ink-900">Payment information</h2>
      {!payment ? (
        <p className="mt-4 text-sm text-ink-500">
          Payment information is unavailable for this order.
        </p>
      ) : (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-600">Method</span>
            <span className="font-medium text-ink-800">
              {isGcash ? "GCash" : "Cash on Delivery"}
            </span>
          </div>
          {isGcash && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-600">Verification</span>
              <Badge
                tone={
                  payment.status === "VERIFIED"
                    ? "leaf"
                    : payment.status === "REJECTED"
                      ? "red"
                      : "gold"
                }
              >
                {payment.status.replace(/_/g, " ")}
              </Badge>
            </div>
          )}
          {isGcash && payment.verifiedAt && (
            <p className="text-ink-600">Verified on {formatDate(payment.verifiedAt)}</p>
          )}
          {isGcash && payment.rejectionReason && (
            <p className="rounded-lg bg-red-50 p-3 text-red-700">{payment.rejectionReason}</p>
          )}
          {!isGcash && <p className="text-ink-600">Pay when your order arrives.</p>}
        </div>
      )}
    </Card>
  );
}


// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function OrderStatusPage() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const parsedOrderId = Number(orderId);
  const hasValidOrderId = Number.isInteger(parsedOrderId) && parsedOrderId > 0;

  const orderQuery = useQuery({
    queryKey: ["order", parsedOrderId],
    queryFn: () => getOrderById(parsedOrderId),
    enabled: hasValidOrderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (status === "COMPLETED" || status === "CANCELLED") {
        return false;
      }

      return 3000;
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelMyOrder(parsedOrderId),
    onSuccess: async (updatedOrder) => {
      setIsCancelModalOpen(false);
      queryClient.setQueryData(["order", parsedOrderId], updatedOrder);
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  if (!hasValidOrderId) {
    return (
      <div className="-mx-4 min-h-full bg-stone-50 p-6 md:-mx-6 md:px-6 lg:-mx-9 lg:px-9">
        <EmptyState
          icon={<Icon name="ticket" className="h-6 w-6" />}
          title="Order not found"
          description="This order link is invalid."
          action={
            <Button variant="secondary" onClick={() => navigate("/orders")}>
              Back to Orders
            </Button>
          }
        />
      </div>
    );
  }

  if (orderQuery.isPending) {
    return (
      <div className="-mx-4 flex min-h-full justify-center bg-stone-50 p-6 py-16 md:-mx-6 md:px-6 lg:-mx-9 lg:px-9">
        <Spinner label="Loading order status…" />
      </div>
    );
  }

  if (orderQuery.error || !orderQuery.data) {
    return (
      <div className="-mx-4 min-h-full bg-stone-50 p-6 md:-mx-6 md:px-6 lg:-mx-9 lg:px-9">
        <PageHeader title="Order status" />
        <Alert
          type="error"
          message={getErrorMessage(
            orderQuery.error,
            "We couldn't load this order. It may no longer be available."
          )}
        />
        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const order = orderQuery.data;
  const isReviewEligible = order.status === "COMPLETED";
  const hasUnreviewedItems = order.orderItems.some((item) => !item.review);

  return (
    <div className="-mx-4 min-h-full bg-stone-50 px-4 md:-mx-6 md:px-6 lg:-mx-9 lg:px-9">
      <article className="mb-6 flex items-center justify-between rounded-2xl bg-[#FFB800] p-5 md:p-6">
        {/* Left side */}
    <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="lg"
            className="w-28 px-3 py-1.5 text-sm text-[#FFB800] md:w-28 md:px-3 md:py-1.5 md:text-base"
            aria-label="Back to Orders"
            onClick={() => navigate("/orders")}
          >
            <Icon
              name="chevronRight"
              className="h-4 w-4 rotate-180 text-[#FFB800]"
            />
            Back
          </Button>
      {order.status === "PENDING" && (
        <Button
          type="button"
          variant="danger"
          size="lg"
          isLoading={cancelMutation.isPending}
          onClick={() => setIsCancelModalOpen(true)}
        >
          Cancel order
        </Button>
      )}
      {isReviewEligible && hasUnreviewedItems && (
        <Button type="button" variant="secondary" size="lg" onClick={() => setIsReviewModalOpen(true)}>
          Rate your order
        </Button>
      )}
      {isReviewEligible && !hasUnreviewedItems && (
        <span className="px-3 text-sm font-medium text-emerald-700">✓ Reviewed</span>
      )}
        </div>

        {/* Right side */}
        <div className="text-right">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Order #{order.customerOrderNumber}
          </h1>

          <p className="mt-1 text-sm text-ink-600">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
      </article>

      <OrderTimeline order={order} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <OrderSummary order={order} />

        <div className="space-y-6">
          <DeliveryInformation order={order} />
          <PaymentInformation order={order} />
        </div>
      </div>

      {isReviewModalOpen && isReviewEligible && hasUnreviewedItems && (
        <ReviewModal
          order={order}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
  {isCancelModalOpen && (
    <CancelOrderModal
      isLoading={cancelMutation.isPending}
      errorMessage={cancelMutation.error ? getErrorMessage(cancelMutation.error, "Could not cancel this order.") : ""}
      onCancel={() => setIsCancelModalOpen(false)}
      onConfirm={() => cancelMutation.mutate()}
    />
  )}
    </div>
  );
}
