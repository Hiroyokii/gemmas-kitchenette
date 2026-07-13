-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "dailyMenuId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_dailyMenuId_fkey" FOREIGN KEY ("dailyMenuId") REFERENCES "DailyMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
