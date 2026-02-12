/*
  Warnings:

  - You are about to alter the column `exactLocation` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "exactLocation" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE INDEX "Item_prefecture_city_idx" ON "Item"("prefecture", "city");
