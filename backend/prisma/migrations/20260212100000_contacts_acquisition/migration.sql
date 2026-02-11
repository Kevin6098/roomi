-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "sourcePlatform" VARCHAR(50) NOT NULL,
    "platformUserId" VARCHAR(120),
    "name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(40),
    "email" VARCHAR(120),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Contact_name_idx" ON "Contact"("name");
CREATE INDEX "Contact_sourcePlatform_idx" ON "Contact"("sourcePlatform");

-- AlterTable: add acquisition_contact_id to Item (nullable; existing rows stay NULL)
ALTER TABLE "Item" ADD COLUMN "acquisitionContactId" TEXT;

-- CreateIndex
CREATE INDEX "Item_acquisitionContactId_idx" ON "Item"("acquisitionContactId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_acquisitionContactId_fkey" FOREIGN KEY ("acquisitionContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
