import api from "../api/axios";
import type { Order, OrderStatus, PaginationMeta } from "../types/Order";

export interface CreateOrderInput {
    items: {
        dailyMenuId: number;
        quantity: number;
    }[];
    deliveryAddress: string;
}

export async function createOrder(
    data: CreateOrderInput
): Promise<Order> {
    const response = await api.post("/orders", data);

    return response.data;
}

export async function getMyOrders(): Promise<Order[]> {
    const response = await api.get("/orders/my");

    return response.data;
}

export async function getAllOrders(
    page: number,
    limit: number
): Promise<{ orders: Order[]; pagination: PaginationMeta }> {
    const response = await api.get("/orders", {
        params: { page, limit },
    });

    return response.data;
}

export async function updateOrderStatus(
    id: number,
    status: OrderStatus
): Promise<Order> {
    const response = await api.patch(`/orders/${id}/status`, { status });

    return response.data;
}

