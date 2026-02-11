-- CreateEnum
CREATE TYPE "RentPeriod" AS ENUM ('monthly', 'annually');

-- AlterTable Customer: add contactId
ALTER TABLE "Customer" ADD COLUMN "contactId" TEXT;
CREATE UNIQUE INDEX "Customer_contactId_key" ON "Customer"("contactId");
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable Sale: handover location fields
ALTER TABLE "Sale" ADD COLUMN "handoverPrefecture" VARCHAR(50);
ALTER TABLE "Sale" ADD COLUMN "handoverCity" VARCHAR(80);
ALTER TABLE "Sale" ADD COLUMN "handoverExactLocation" VARCHAR(255);

-- AlterTable Rental: rent period and handover location fields
ALTER TABLE "Rental" ADD COLUMN "rentPeriod" "RentPeriod" NOT NULL DEFAULT 'monthly';
ALTER TABLE "Rental" ADD COLUMN "rentPriceAnnually" DECIMAL(12,2);
ALTER TABLE "Rental" ADD COLUMN "handoverPrefecture" VARCHAR(50);
ALTER TABLE "Rental" ADD COLUMN "handoverCity" VARCHAR(80);
ALTER TABLE "Rental" ADD COLUMN "handoverExactLocation" VARCHAR(255);
