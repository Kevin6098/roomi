-- Add location fields to Contact so Edit contact/customer form can record and pre-fill handover
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "prefecture" VARCHAR(50);
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "city" VARCHAR(80);
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "exactLocation" VARCHAR(255);
