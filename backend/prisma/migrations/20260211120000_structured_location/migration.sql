-- CreateEnum
CREATE TYPE "LocationVisibility" AS ENUM ('hidden', 'shown');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN "prefecture" VARCHAR(50) NOT NULL DEFAULT 'Undecided';
ALTER TABLE "Item" ADD COLUMN "city" VARCHAR(80) NOT NULL DEFAULT 'Undecided';
ALTER TABLE "Item" ADD COLUMN "locationVisibility" "LocationVisibility" NOT NULL DEFAULT 'hidden';
