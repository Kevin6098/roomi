-- File: backend/schema-migration-add-columns.sql
-- Run this if you already have the DB and only need to add new columns (keeps existing data).
-- Run once. If a column already exists, skip that statement or run individually.

ALTER TABLE items ADD COLUMN acquisition_date DATE NULL AFTER status;
UPDATE items SET acquisition_date = COALESCE(DATE(created_at), CURRENT_DATE) WHERE acquisition_date IS NULL;
ALTER TABLE items MODIFY COLUMN acquisition_date DATE NOT NULL;

ALTER TABLE rentals ADD COLUMN expected_end_date DATE NULL AFTER end_date;

ALTER TABLE sales ADD COLUMN notes TEXT NULL AFTER platform_sold;

ALTER TABLE customers ADD COLUMN platform VARCHAR(100) NULL AFTER email;
ALTER TABLE customers ADD COLUMN app_id VARCHAR(100) NULL AFTER platform;
