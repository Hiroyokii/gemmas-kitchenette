import { prisma } from "../lib/prisma.js";
import { OrderStatus, Prisma } from "../generated/prisma/index.js";

import { 
    createOrder, 
    createOrderItems, 
    findOrdersByCustomer, 
    findOrderByIdForCustomer,
    findAllOrders, 
    findOrderById, 
    updateOrderStatus,
    findPaymentForOrder,
} from "../repositories/order.repository.js";
import { findDailyMenuById, decreaseRemainingServings } from "../repositories/dailyMenu.repository.js";

import type { CreateOrderInput } from "../schemas/order.schema.js";

import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { getManilaCalendarDate, getManilaDayStart, isInManilaDay } from "../utils/manilaDay.js";

export async function createOrderService(
    customerId: number,
    data: CreateOrderInput
) {
    const menuIds = data.items.map(
        item => item.dailyMenuId
    );

    const uniqueIds = new Set(menuIds);
    const today = getManilaDayStart();

    if (menuIds.length !== uniqueIds.size) {
        throw new BadRequestError(
            "Order contains duplicate menu items."
        );
    }

    const menus: Prisma.DailyMenuGetPayload<{
        include: {
            food: true;
        };
    }> [] = [];

    for (const item of data.items) {
        const menu =
            await findDailyMenuById(
                item.dailyMenuId
            );
        
        if (!menu) {
            throw new NotFoundError(
                "Daily menu not found."
            );
        }

        if (!isInManilaDay(menu.date, today)) {
            throw new BadRequestError(
                `${menu.food.name} is no longer on today's menu. Please refresh your cart.`
            );
        }

        if (menu.remainingServings < item.quantity) 
            throw new BadRequestError(
                `${menu.food.name} has insufficient servings.`
            );

        menus.push(menu);
    }

    for (const item of data.items) {
        const menu = 
            menus.find(
                menu => menu.id === item.dailyMenuId
            )!;

        if (
            menu.remainingServings < item.quantity
        ) {
            throw new BadRequestError(
                `${menu.food.name} has insufficient servings.`
            );
        }
    }

    const orderItems = 
        data.items.map(item => {
            const menu = 
                menus.find(
                    menu => menu.id === item.dailyMenuId
                )!;
            
            return {
                dailyMenuId: item.dailyMenuId,
                quantity: item.quantity,
                price: Number(menu.food.price),
            };
        });

    const total = 
        orderItems.reduce(
            (sum, item) => 
                sum + item.price * item.quantity,
            0
        );

    return prisma.$transaction(async (tx) => {
        const dailyOrderDate = getManilaCalendarDate();
        const [customerCounter, dailyCounter] = await Promise.all([
            tx.customerOrderCounter.upsert({
                where: { customerId },
                create: { customerId, lastNumber: 1 },
                update: { lastNumber: { increment: 1 } },
                select: { lastNumber: true },
            }),
            tx.dailyOrderCounter.upsert({
                where: { date: dailyOrderDate },
                create: { date: dailyOrderDate, lastNumber: 1 },
                update: { lastNumber: { increment: 1 } },
                select: { lastNumber: true },
            }),
        ]);

        let deliveryAddress: string | null = null;
        if (data.orderType === "DELIVERY") {
            const customer = await tx.user.findUnique({
                where: { id: customerId },
                select: { block: true, lot: true, street: true, landmark: true },
            });
            const savedAddress = customer
                ? {
                    block: customer.block.trim(),
                    lot: customer.lot.trim(),
                    street: customer.street.trim(),
                    landmark: customer.landmark?.trim(),
                }
                : null;

            if (!savedAddress?.block || !savedAddress.lot || !savedAddress.street) {
                throw new BadRequestError(
                    "Please complete your saved delivery address before placing a delivery order."
                );
            }
            deliveryAddress = [
                `Block ${savedAddress.block}`,
                `Lot ${savedAddress.lot}`,
                savedAddress.street,
                savedAddress.landmark,
            ].filter((part): part is string => Boolean(part)).join(", ");
        }

        const order = await createOrder(
            tx,
            customerId,
            deliveryAddress,
            total,
            data.orderType,
            customerCounter.lastNumber,
            dailyCounter.lastNumber,
            dailyOrderDate,
            data.notes,
        );

        await createOrderItems(
            tx,
            order.id,
            orderItems
        );

        await tx.payment.create({ 
            data: { 
                orderId: order.id, 
                method: data.paymentMethod, 
                status: data.paymentMethod === "COD" 
                    ? "NOT_APPLICABLE" 
                    : "PENDING" 
                } });

        for (const item of orderItems) {
            const updatedRows = await decreaseRemainingServings(
                tx,
                item.dailyMenuId,
                item.quantity
            );

            if (updatedRows === null) {
                const menu = menus.find(
                    m => m.id === item.dailyMenuId
                )!;

                throw new BadRequestError(
                    `${menu.food.name} no longer has enough servings available.`
                );
            }
        }

        return tx.order.findUniqueOrThrow({ 
            where: { 
                id: order.id 
            }, 
            include: { 
                payment: true, 
                orderItems: { 
                    include: { 
                        dailyMenu: { 
                            include: { 
                                food: true 
                            } 
                        } 
                    } 
                } 
            } 
        });
    });
}

export async function updateOrderStatusService(
    orderId: number,
    status: OrderStatus
) {
    const order = await findOrderById(orderId);

    if (!order) {
        throw new NotFoundError(
            "Order not found."
        )
    }

    const transitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: [
            OrderStatus.CONFIRMED, 
            OrderStatus.CANCELLED
        ], 
        CONFIRMED: [
            OrderStatus.PREPARING
        ], 
        PREPARING: [
            OrderStatus.OUT_FOR_DELIVERY
        ], 
        OUT_FOR_DELIVERY: [
            OrderStatus.COMPLETED
        ], 
        COMPLETED: [], 
        CANCELLED: [],
    };

    if (!transitions[order.status].includes(status)) 
        throw new BadRequestError(
            `Cannot change order from ${order.status} to ${status}.`
        );

    if (order.payment?.method === "GCASH" 
        && order.payment.status !== "VERIFIED" 
        && status === "CONFIRMED"
    ) throw new BadRequestError(
        "GCash payment must be verified before confirming the order."
        );

    return prisma.$transaction((tx) => 
        updateOrderStatus(
            tx, 
            orderId, 
            status
        ));
}

export async function submitPaymentProofService(
    orderId: number, 
    customerId: number, 
    screenshotDataUrl: string,
) {
    const order = await prisma.order.findFirst({ 
        where: { 
            id: orderId, 
            customerId 
        }, 
        include: { 
            payment: true 
        } 
    });

    if (!order || !order.payment) 
        throw new NotFoundError(
            "Order payment not found."
        );

    if (order.payment.method !== "GCASH") 
        throw new BadRequestError(
            "This order does not use GCash."
        );

    if (order.payment.status === "VERIFIED") 
        throw new BadRequestError(
            "Payment is already verified."
        );

    if (order.status !== "PENDING") {
        throw new BadRequestError("Payment proof can only be submitted while an order is pending.");
    }

    validatePaymentScreenshot(screenshotDataUrl);

    return prisma.payment.update({ 
        where: { 
            id: order.payment.id 
        }, 
        data: { 
            proofImage: screenshotDataUrl,
            proofSubmittedAt: new Date(),
            status: "PENDING", 
            rejectionReason: null 
        }
    });
}

function validatePaymentScreenshot(dataUrl: string): void {
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
    if (!match) {
        throw new BadRequestError("Payment screenshot must be a JPG, PNG, or WebP image.");
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 2 * 1024 * 1024 || buffer.length === 0 || buffer.toString("base64") !== match[2]) {
        throw new BadRequestError("Payment screenshot must be 2 MB or smaller and contain valid image data.");
    }

    const isPng = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
    const mimeType = match[1];

    if (!((mimeType === "image/png" && isPng) || (mimeType === "image/jpeg" && isJpeg) || (mimeType === "image/webp" && isWebp))) {
        throw new BadRequestError("Payment screenshot contents do not match the selected image type.");
    }
}

export async function getPaymentProofService(orderId: number, userId: number, role: string) {
    const payment = await prisma.payment.findUnique({
        where: { orderId },
        select: { proofImage: true, order: { select: { customerId: true } } },
    });

    if (!payment || (role === "CUSTOMER" && payment.order.customerId !== userId)) {
        throw new NotFoundError("Payment proof not found.");
    }
    if (!payment.proofImage) throw new NotFoundError("Payment screenshot not found.");
    return payment.proofImage;
}

export async function verifyPaymentService(
    orderId: number, 
    adminId: number
) {
    return prisma.$transaction(async (tx) => {
        const payment = await findPaymentForOrder(tx, orderId);

        if (!payment) throw new NotFoundError("Payment not found.");
        if (payment.method !== "GCASH") {
            throw new BadRequestError("Only GCash payments require verification.");
        }
        if (payment.order.status !== "PENDING") {
            throw new BadRequestError("Only pending orders can have their payment verified.");
        }
        if (payment.status !== "PENDING" || !payment.proofImage) {
            throw new BadRequestError("A GCash payment screenshot is required for verification.");
        }

        await tx.payment.update({ 
            where: { 
                id: payment.id 
            }, 
            data: { 
                status: "VERIFIED", 
                verifiedAt: new Date(), 
                verifiedById: adminId, 
                rejectionReason: null 
            } 
        });

        return tx.order.findUniqueOrThrow({ 
            where: { 
                id: orderId 
            }, 
            include: { 
                payment: true, 
                orderItems: { 
                    include: { 
                        dailyMenu: { 
                            include: { 
                                food: true 
                            } 
                        }, 
                        review: 
                        true 
                    } 
                } 
            } 
        });
    });
}

export async function rejectPaymentService(
    orderId: number, 
    reason: string
) {
    return prisma.$transaction(async (tx) => {
        const payment = await findPaymentForOrder(tx, orderId);
        if (!payment) throw new NotFoundError("Payment not found.");
        if (payment.method !== "GCASH") {
            throw new BadRequestError("Only GCash payments can be rejected.");
        }
        if (payment.order.status !== "PENDING") {
            throw new BadRequestError("Only pending orders can have their payment rejected.");
        }
        if (payment.status !== "PENDING" || !payment.proofImage) {
            throw new BadRequestError("A GCash payment screenshot is required for rejection.");
        }

        return tx.payment.update({
            where: { id: payment.id },
            data: {
                status: "REJECTED",
                rejectionReason: reason.trim(),
                verifiedAt: null,
                verifiedById: null,
            },
        });
    });
}

export async function getMyOrdersService(
    customerId: number
) {
    return findOrdersByCustomer(
        customerId
    );
}

export async function getOrderByIdForCustomerService(
    orderId: number,
    customerId: number
) {
    const order = await findOrderByIdForCustomer(orderId, customerId);

    if (!order) {
        throw new NotFoundError("Order not found.");
    }

    return order;
}

export async function getAllOrdersService(
    page: number,
    limit: number,
    date?: string,
) {
    const orderDate = date ? new Date(`${date}T00:00:00.000Z`) : undefined;
    const { orders, total } = await findAllOrders(
        page,
        limit,
        orderDate,
    );

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}



