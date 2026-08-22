import type { OrderStatus } from "../types/Order";

type BadgeTone = "gold" | "brand" | "leaf" | "neutral" | "red";

interface StatusMeta {
    label: string;
    tone: BadgeTone;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
    PENDING: { label: "Pending", tone: "gold" },
    CONFIRMED: { label: "Confirmed", tone: "brand" },
    PREPARING: { label: "Preparing", tone: "brand" },
    OUT_FOR_DELIVERY: { label: "Out for delivery", tone: "leaf" },
    COMPLETED: { label: "Completed", tone: "leaf" },
    CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING"],
    PREPARING: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
};
