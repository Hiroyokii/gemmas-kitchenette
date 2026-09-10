-- Each PurchaseItem represents an inventory batch. Existing historical rows
-- retain a null expiration date because the source data did not capture one.
ALTER TABLE "PurchaseItem"
ADD COLUMN "remainingQuantity" DECIMAL(10,2),
ADD COLUMN "expirationDate" TIMESTAMP(3);

UPDATE "PurchaseItem"
SET "remainingQuantity" = "quantity"
WHERE "remainingQuantity" IS NULL;

ALTER TABLE "PurchaseItem"
ALTER COLUMN "remainingQuantity" SET NOT NULL;

CREATE INDEX "PurchaseItem_expirationDate_idx" ON "PurchaseItem"("expirationDate");
