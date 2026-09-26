ALTER TABLE "Order"
ADD COLUMN "customerOrderNumber" INTEGER,
ADD COLUMN "dailyOrderNumber" INTEGER,
ADD COLUMN "dailyOrderDate" DATE;

WITH customer_sequences AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "customerId" ORDER BY "createdAt", "id")::INTEGER AS sequence
  FROM "Order"
), daily_sequences AS (
  SELECT "id",
         ("createdAt" AT TIME ZONE 'Asia/Manila')::date AS order_date,
         ROW_NUMBER() OVER (
           PARTITION BY ("createdAt" AT TIME ZONE 'Asia/Manila')::date
           ORDER BY "createdAt", "id"
         )::INTEGER AS sequence
  FROM "Order"
)
UPDATE "Order" AS orders
SET "customerOrderNumber" = customer_sequences.sequence,
    "dailyOrderNumber" = daily_sequences.sequence,
    "dailyOrderDate" = daily_sequences.order_date
FROM customer_sequences
JOIN daily_sequences ON daily_sequences."id" = customer_sequences."id"
WHERE orders."id" = customer_sequences."id";

ALTER TABLE "Order"
ALTER COLUMN "customerOrderNumber" SET NOT NULL,
ALTER COLUMN "dailyOrderNumber" SET NOT NULL,
ALTER COLUMN "dailyOrderDate" SET NOT NULL;

CREATE UNIQUE INDEX "Order_customerId_customerOrderNumber_key"
ON "Order"("customerId", "customerOrderNumber");

CREATE UNIQUE INDEX "Order_dailyOrderDate_dailyOrderNumber_key"
ON "Order"("dailyOrderDate", "dailyOrderNumber");

CREATE TABLE "CustomerOrderCounter" (
  "customerId" INTEGER NOT NULL,
  "lastNumber" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CustomerOrderCounter_pkey" PRIMARY KEY ("customerId"),
  CONSTRAINT "CustomerOrderCounter_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "DailyOrderCounter" (
  "date" DATE NOT NULL,
  "lastNumber" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "DailyOrderCounter_pkey" PRIMARY KEY ("date")
);

INSERT INTO "CustomerOrderCounter" ("customerId", "lastNumber")
SELECT "customerId", MAX("customerOrderNumber")
FROM "Order"
GROUP BY "customerId";

INSERT INTO "DailyOrderCounter" ("date", "lastNumber")
SELECT "dailyOrderDate", MAX("dailyOrderNumber")
FROM "Order"
GROUP BY "dailyOrderDate";
