CREATE TYPE "SpoilageReason" AS ENUM ('EXPIRED', 'SPOILED', 'WASTE');

CREATE TABLE "SpoilageRecord" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "purchaseItemId" INTEGER,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "reason" "SpoilageReason" NOT NULL,
    "notes" TEXT,
    "recordedById" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BatchSpoilageRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BatchSpoilageRecord_ingredientId_idx" ON "SpoilageRecord"("ingredientId");
CREATE INDEX "BatchSpoilageRecord_purchaseItemId_idx" ON "SpoilageRecord"("purchaseItemId");
CREATE INDEX "BatchSpoilageRecord_recordedAt_idx" ON "SpoilageRecord"("recordedAt");

ALTER TABLE "SpoilageRecord" ADD CONSTRAINT "SpoilageRecord_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SpoilageRecord" ADD CONSTRAINT "SpoilageRecord_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "PurchaseItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SpoilageRecord" ADD CONSTRAINT "SpoilageRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Restore legacy history. Older rows did not identify a purchase batch.
INSERT INTO "SpoilageRecord" ("ingredientId", "quantity", "unitCost", "reason", "notes", "recordedById", "recordedAt")
SELECT "ingredientId", "quantity", "unitCost",
    CASE WHEN "reason" IN ('EXPIRED', 'SPOILED', 'WASTE') THEN "reason"::"SpoilageReason" ELSE 'WASTE'::"SpoilageReason" END,
    "notes", "recordedById", "createdAt"
FROM "LegacySpoilageRecord";
