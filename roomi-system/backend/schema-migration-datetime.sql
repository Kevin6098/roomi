-- Add time support: DATE -> DATETIME for rentals and sales (hour + minute).
-- Existing rows keep date with time 00:00:00.

ALTER TABLE rentals MODIFY start_date DATETIME NOT NULL;
ALTER TABLE rentals MODIFY end_date DATETIME NULL;
ALTER TABLE rentals MODIFY expected_end_date DATETIME NULL;

ALTER TABLE sales MODIFY sale_date DATETIME NOT NULL;
