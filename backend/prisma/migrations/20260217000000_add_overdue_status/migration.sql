-- Add 'overdue' to ItemStatus enum (in-stock items in stock for a month with no buyer)
ALTER TYPE "ItemStatus" ADD VALUE 'overdue' BEFORE 'in_stock';
