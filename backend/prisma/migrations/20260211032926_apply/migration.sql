/*
  Warnings:

  - Made the column `expectedEndDate` on table `Rental` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Rental" ALTER COLUMN "expectedEndDate" SET NOT NULL;
