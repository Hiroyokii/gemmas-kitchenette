import type { OrderStatus } from "../types/Order";

type BadgeTone = "gold" | "brand" | "leaf" | "neutral" | "red";

interface StatusMeta {
    label: string;
    tone: BadgeTone;
    badgeClassName: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
    PENDING: {
        label: "Pending",
        tone: "gold",
        badgeClassName: "border border-amber-200 bg-amber-50 text-amber-700",
    },
    CONFIRMED: {
        label: "Confirmed",
        tone: "brand",
        badgeClassName: "border border-blue-200 bg-blue-50 text-blue-700",
    },
    PREPARING: {
        label: "Preparing",
        tone: "brand",
        badgeClassName: "border border-orange-200 bg-orange-50 text-orange-700",
    },
    OUT_FOR_DELIVERY: {
        label: "Out for delivery",
        tone: "leaf",
        badgeClassName: "border border-violet-200 bg-violet-50 text-violet-700",
    },
    COMPLETED: {
        label: "Completed",
        tone: "leaf",
        badgeClassName: "border border-green-200 bg-green-50 text-green-700",
    },
    CANCELLED: {
        label: "Cancelled",
        tone: "neutral",
        badgeClassName: "border border-red-200 bg-red-50 text-red-700",
    },
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING"],
    PREPARING: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
};
