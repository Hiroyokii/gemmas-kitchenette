import api from "../api/axios";
import type { Order, OrderStatus, PaginationMeta } from "../types/Order";

export type PaymentMethod = "COD" | "GCASH";
export type PaymentStatus = "NOT_APPLICABLE" | "PENDING" | "VERIFIED" | "REJECTED";

export interface CreateOrderInput {
  items: { dailyMenuId: number; quantity: number }[];
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
}

export interface CreateReviewInput {
  orderItemId: number;
  rating: number;
  comment?: string;
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
  const response = await api.get("/orders", { params: { page, limit } });
  
  return response.data;
}

export async function updateOrderStatus(
    id: number, 
    status: OrderStatus
): Promise<Order> {
  const response = await api.patch(`/orders/${id}/status`, { status });

  return response.data;
}

export async function verifyPayment(
    id: number
): Promise<Order> {
  const response = await api.patch(`/orders/${id}/payment/verify`);

  return response.data;
}

export async function rejectPayment(
    id: number, 
    reason?: string
): Promise<Order> {
  const response = await api.patch(`/orders/${id}/payment/reject`, { reason });

  return response.data;
}

export async function submitReview(
    data: CreateReviewInput
): Promise<unknown> {
  const response = await api.post("/reviews", data);
  
  return response.data;
}