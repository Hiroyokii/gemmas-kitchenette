import api from "../api/axios";
import type { Order, OrderStatus, PaginationMeta } from "../types/Order";

export type PaymentMethod = "COD" | "GCASH";
export type OrderType = "PICKUP" | "DELIVERY";
export type PaymentStatus = "NOT_APPLICABLE" | "PENDING" | "VERIFIED" | "REJECTED";

export interface CreateOrderInput {
  items: { dailyMenuId: number; quantity: number }[];
  paymentMethod: PaymentMethod;
  orderType: OrderType;
  notes?: string;
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

export async function getOrderById(orderId: number): Promise<Order> {
  const response = await api.get(`/orders/${orderId}`);

  return response.data;
}

export async function getAllOrders(
  page: number,
  limit: number,
  date?: string,
): Promise<{ orders: Order[]; pagination: PaginationMeta }> {
  const response = await api.get("/orders", { params: { page, limit, date } });
  
  return response.data;
}

export async function updateOrderStatus(
    id: number, 
    status: OrderStatus
): Promise<Order> {
  const response = await api.patch(`/orders/${id}/status`, { status });

  return response.data;
}

export async function cancelMyOrder(id: number): Promise<Order> {
  const response = await api.patch(`/orders/${id}/cancel`);
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
    reason: string
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

export async function submitPaymentProof(
    id: number,
    screenshotDataUrl: string,
): Promise<unknown> {
  const response = await api.patch(`/orders/${id}/payment/proof`, {
    screenshotDataUrl,
  });
  return response.data;
}

export async function getPaymentProof(id: number): Promise<string> {
  const response = await api.get<{ screenshotDataUrl: string }>(`/orders/${id}/payment/proof`);
  return response.data.screenshotDataUrl;
}
