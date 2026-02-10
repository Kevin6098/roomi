-- File: backend/schema-migration-categories.sql
-- Migration: add main_categories + sub_categories, move items from category to sub_category_id
-- Run this on an existing DB that has items.category. Then items will use sub_category_id.

-- 1. Create new tables (order matters: main before sub)
CREATE TABLE IF NOT EXISTS main_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_main_categories_name (name(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sub_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  main_category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (main_category_id) REFERENCES main_categories(id) ON DELETE CASCADE,
  INDEX idx_sub_categories_main (main_category_id),
  UNIQUE KEY uq_main_sub (main_category_id, name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Seed "Uncategorized" and create sub_categories for all existing item category values
INSERT IGNORE INTO main_categories (name) VALUES ('Uncategorized');
SET @uncat_id = (SELECT id FROM main_categories WHERE name = 'Uncategorized' LIMIT 1);

-- Insert known legacy category names under Uncategorized
INSERT IGNORE INTO sub_categories (main_category_id, name) VALUES
  (@uncat_id, 'fridge'), (@uncat_id, 'washing_machine'), (@uncat_id, 'bed'),
  (@uncat_id, 'desk'), (@uncat_id, 'sofa'), (@uncat_id, 'table'), (@uncat_id, 'chair'), (@uncat_id, 'other');

-- Insert any other distinct category values that appear in items
INSERT IGNORE INTO sub_categories (main_category_id, name)
SELECT @uncat_id, cat FROM (
  SELECT DISTINCT COALESCE(NULLIF(TRIM(category), ''), 'other') AS cat FROM items
) t;

-- 3. Add sub_category_id to items (nullable first)
ALTER TABLE items ADD COLUMN sub_category_id INT NULL AFTER title;
ALTER TABLE items ADD INDEX idx_items_sub_category_id (sub_category_id);

-- 4. Backfill from current category
UPDATE items i
JOIN sub_categories sc ON sc.main_category_id = @uncat_id AND sc.name = COALESCE(NULLIF(TRIM(i.category), ''), 'other')
SET i.sub_category_id = sc.id
WHERE i.sub_category_id IS NULL;

-- 5. Default any remaining to "other"
UPDATE items i
JOIN sub_categories sc ON sc.main_category_id = @uncat_id AND sc.name = 'other'
SET i.sub_category_id = sc.id
WHERE i.sub_category_id IS NULL;

-- 6. Enforce NOT NULL and FK
ALTER TABLE items MODIFY sub_category_id INT NOT NULL;
ALTER TABLE items ADD CONSTRAINT fk_items_sub_category FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE RESTRICT;

-- 7. Drop old column and index
ALTER TABLE items DROP INDEX idx_category;
ALTER TABLE items DROP COLUMN category;
