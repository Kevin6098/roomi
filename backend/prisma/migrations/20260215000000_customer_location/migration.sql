-- AlterTable Customer: add default location (prefecture, city, exactLocation)
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "prefecture" VARCHAR(50);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "city" VARCHAR(80);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "exactLocation" VARCHAR(255);
