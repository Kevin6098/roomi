-- Add 'overdue' to ItemStatus enum (in-stock items in stock for a month with no buyer).
-- Idempotent: no-op if the value already exists (e.g. re-run or partially applied).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ItemStatus' AND e.enumlabel = 'overdue'
  ) THEN
    ALTER TYPE "ItemStatus" ADD VALUE 'overdue' BEFORE 'in_stock';
  END IF;
END
$$;
