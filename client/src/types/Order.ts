import type { Food } from "./Food";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "OUT_FOR_DELIVERY"
    | "COMPLETED"
    | "CANCELLED";

export interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    dailyMenu: {
        id: number;
        food: Food;
    };
}

export interface Order {
    id: number;
    status: OrderStatus;
    total: number;
    deliveryAddress: string;
    createdAt: string;
    payment?: {
        method: "COD" | "GCASH";
        status: "NOT_APPLICABLE" | "PENDING" | "VERIFIED" | "REJECTED";
        referenceNumber?: string | null;
        rejectionReason?: string | null;
        verifiedAt?: string | null;
    } | null;
    customer: {
        id: number;
        firstName: string;
        lastName: string;
    };
    orderItems: OrderItem[];
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
