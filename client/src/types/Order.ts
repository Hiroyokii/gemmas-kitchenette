import type { Food } from "./Food";

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "OUT_FOR_DELIVERY"
    | "COMPLETED"
    | "CANCELLED";

export type OrderType = "PICKUP" | "DELIVERY";

export interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    dailyMenu: {
        id: number;
        food: Food;
    };
    review?: {
        id: number;
        rating: number;
        comment?: string | null;
        createdAt: string;
    } | null;
}

export interface Order {
    id: number;
    status: OrderStatus;
    total: number;
    deliveryAddress: string | null;
    orderType: OrderType;
    notes?: string | null;
    customerOrderNumber: number;
    dailyOrderNumber: number;
    dailyOrderDate: string;
    createdAt: string;
    completedAt?: string | null;
    cancelledAt?: string | null;
    payment?: {
        method: "COD" | "GCASH";
        status: "NOT_APPLICABLE" | "PENDING" | "VERIFIED" | "REJECTED";
        proofSubmittedAt?: string | null;
        rejectionReason?: string | null;
        verifiedAt?: string | null;
    } | null;
    customer: {
        id: number;
        firstName: string;
        lastName: string;
        email?: string;
        phoneNumber?: string;
    };
    orderItems: OrderItem[];
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
