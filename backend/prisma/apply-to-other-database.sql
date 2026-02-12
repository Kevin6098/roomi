-- =============================================================================
-- SQL to apply Roomi schema changes to another PostgreSQL database
-- Run this after your base schema exists. Copy and paste the whole file.
-- =============================================================================

-- 1) Item status: add 'overdue' (in-stock items in stock 1+ month with no buyer)
--    Run ONE of the two lines below. If you get "already exists", skip.
ALTER TYPE "ItemStatus" ADD VALUE 'overdue';
-- Optional (PostgreSQL 10+): put overdue first in enum order:
-- ALTER TYPE "ItemStatus" ADD VALUE 'overdue' BEFORE 'in_stock';

-- 2) Contact: add location fields (for Edit customer/contact form and handover pre-fill)
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "prefecture" VARCHAR(50);
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "city" VARCHAR(80);
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "exactLocation" VARCHAR(255);
