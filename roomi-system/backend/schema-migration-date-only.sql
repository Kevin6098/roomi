-- Revert to date-only: DATETIME -> DATE for rentals and sales.
-- Time portion is dropped; date is kept.

ALTER TABLE rentals MODIFY start_date DATE NOT NULL;
ALTER TABLE rentals MODIFY end_date DATE NULL;
ALTER TABLE rentals MODIFY expected_end_date DATE NULL;

ALTER TABLE sales MODIFY sale_date DATE NOT NULL;
