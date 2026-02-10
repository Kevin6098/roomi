-- Optional exact location: where item is from (items) or where it will go (rentals, sales).

ALTER TABLE items ADD COLUMN exact_location VARCHAR(255) NULL AFTER location_area;
ALTER TABLE rentals ADD COLUMN exact_location VARCHAR(255) NULL COMMENT 'where item will go' AFTER notes;
ALTER TABLE sales ADD COLUMN exact_location VARCHAR(255) NULL COMMENT 'where item will go' AFTER notes;
