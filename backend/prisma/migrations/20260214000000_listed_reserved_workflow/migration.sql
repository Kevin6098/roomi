-- Add isListed to Item
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "isListed" BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing 'listed' status to in_stock + isListed
UPDATE "Item" SET "isListed" = true WHERE "status" = 'listed';
UPDATE "Item" SET "status" = 'in_stock' WHERE "status" = 'listed';

-- CreateEnum ListingStatus
CREATE TYPE "ListingStatus" AS ENUM ('active', 'needs_update', 'closed');

-- CreateEnum ReserveType
CREATE TYPE "ReserveType" AS ENUM ('sale', 'rental');

-- CreateEnum ReservationStatus
CREATE TYPE "ReservationStatus" AS ENUM ('active', 'cancelled', 'converted');

-- CreateTable ItemListing
CREATE TABLE "ItemListing" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "listingUrl" VARCHAR(255),
    "listingRefId" VARCHAR(120),
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable Reservation
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "contactId" TEXT,
    "reserveType" "ReserveType" NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "depositExpected" DECIMAL(10,2),
    "depositReceived" BOOLEAN NOT NULL DEFAULT false,
    "depositReceivedAt" TIMESTAMP(3),
    "note" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex ItemListing_itemId
CREATE INDEX "ItemListing_itemId_idx" ON "ItemListing"("itemId");

-- CreateIndex ItemListing_platform
CREATE INDEX "ItemListing_platform_idx" ON "ItemListing"("platform");

-- CreateIndex ItemListing_status
CREATE INDEX "ItemListing_status_idx" ON "ItemListing"("status");

-- CreateIndex Reservation_itemId
CREATE INDEX "Reservation_itemId_idx" ON "Reservation"("itemId");

-- CreateIndex Reservation_contactId
CREATE INDEX "Reservation_contactId_idx" ON "Reservation"("contactId");

-- CreateIndex Reservation_status
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex Item_isListed
CREATE INDEX "Item_isListed_idx" ON "Item"("isListed");

-- AddForeignKey ItemListing
ALTER TABLE "ItemListing" ADD CONSTRAINT "ItemListing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Reservation
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Replace ItemStatus enum: remove 'listed'
CREATE TYPE "ItemStatus_new" AS ENUM ('in_stock', 'reserved', 'rented', 'sold', 'disposed');

ALTER TABLE "Item" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Item" ALTER COLUMN "status" TYPE "ItemStatus_new" USING (
  CASE WHEN "status"::text = 'listed' THEN 'in_stock'::"ItemStatus_new" ELSE "status"::text::"ItemStatus_new" END
);
ALTER TABLE "Item" ALTER COLUMN "status" SET DEFAULT 'in_stock'::"ItemStatus_new";

DROP TYPE "ItemStatus";
ALTER TYPE "ItemStatus_new" RENAME TO "ItemStatus";
