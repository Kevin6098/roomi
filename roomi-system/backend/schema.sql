-- File: backend/schema.sql
-- ROOMI / SecondLife Japan - MySQL schema (with Main + Sub Categories)

-- Create database (run manually if needed: CREATE DATABASE roomi_db; USE roomi_db;)

DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS sub_categories;
DROP TABLE IF EXISTS main_categories;

-- Main categories (e.g. Furniture, Electronics)
CREATE TABLE main_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_main_categories_name (name(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sub categories under a main category (e.g. bed, desk under Furniture)
CREATE TABLE sub_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  main_category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (main_category_id) REFERENCES main_categories(id) ON DELETE CASCADE,
  INDEX idx_sub_categories_main (main_category_id),
  UNIQUE KEY uq_main_sub (main_category_id, name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Items: second-hand inventory
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  sub_category_id INT NOT NULL,
  source_platform VARCHAR(100) DEFAULT NULL,
  acquisition_type ENUM('free', 'cheap', 'bought') NOT NULL DEFAULT 'bought',
  acquisition_cost DECIMAL(12,2) DEFAULT 0,
  original_price DECIMAL(12,2) DEFAULT NULL,
  `condition` ENUM('new', 'good', 'fair', 'poor') NOT NULL DEFAULT 'good',
  location_area VARCHAR(100) DEFAULT NULL,
  exact_location VARCHAR(255) DEFAULT NULL,
  status ENUM('in_stock', 'listed', 'rented', 'sold', 'reserved', 'disposed') NOT NULL DEFAULT 'in_stock',
  acquisition_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_sub_category_id (sub_category_id),
  INDEX idx_title (title(50)),
  INDEX idx_acquisition_date (acquisition_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  platform VARCHAR(100) DEFAULT NULL,
  app_id VARCHAR(100) DEFAULT NULL,
  preferred_language ENUM('jp', 'en', 'cn') NOT NULL DEFAULT 'jp',
  customer_type ENUM('buyer', 'renter', 'both') NOT NULL DEFAULT 'both',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name(50)),
  INDEX idx_platform (platform(20))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rentals
CREATE TABLE rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  customer_id INT NOT NULL,
  rent_price_monthly DECIMAL(12,2) NOT NULL,
  deposit DECIMAL(12,2) DEFAULT NULL,
  start_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  expected_end_date DATE DEFAULT NULL,
  status ENUM('active', 'ended', 'overdue') NOT NULL DEFAULT 'active',
  damage_fee DECIMAL(12,2) DEFAULT NULL,
  notes TEXT,
  exact_location VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  INDEX idx_rentals_item (item_id),
  INDEX idx_rentals_customer (customer_id),
  INDEX idx_rentals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sales
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  customer_id INT NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  sale_date DATE NOT NULL,
  platform_sold VARCHAR(100) DEFAULT NULL,
  notes TEXT,
  exact_location VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  INDEX idx_sales_item (item_id),
  INDEX idx_sales_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default main + sub categories (main id 1=Furniture, 2=Electronics, 3=Fashion, 4=Appliance)
INSERT INTO main_categories (name) VALUES
  ('Furniture'),
  ('Electronics'),
  ('Fashion'),
  ('Appliance');
INSERT INTO sub_categories (main_category_id, name) VALUES
  (1, 'bed'), (1, 'desk'), (1, 'sofa'), (1, 'chair'), (1, 'table'), (1, 'other'),
  (2, 'fridge'), (2, 'washing_machine'), (2, 'microwave'), (2, 'tv'),
  (3, 'jacket'), (3, 'shoes'), (3, 'bag'),
  (4, 'rice_cooker'), (4, 'kettle'), (4, 'vacuum');
