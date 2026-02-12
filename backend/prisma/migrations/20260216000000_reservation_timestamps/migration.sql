-- AlterTable Reservation: add cancelledAt, convertedAt
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);
