-- ROOMI: Table change + category seed (run after main migrations)
-- 1) Add custom_sub_category to Item
-- 2) Safe category seed (no duplicates)

-- ========== TABLE CHANGE ==========
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "customSubCategory" VARCHAR(120);

-- ========== SEED: Main categories (upsert) ==========
INSERT INTO "MainCategory" (id, name, "nameEn", "nameJa", "createdAt")
VALUES
  (gen_random_uuid()::text, 'Furniture', 'Furniture', '家具', now()),
  (gen_random_uuid()::text, 'Electronics', 'Electronics', '電子機器', now()),
  (gen_random_uuid()::text, 'Appliance', 'Appliance', '家電', now()),
  (gen_random_uuid()::text, 'Fashion', 'Fashion', 'ファッション', now()),
  (gen_random_uuid()::text, 'Bedding_Textiles', 'Bedding_Textiles', '寝具・布類', now()),
  (gen_random_uuid()::text, 'Kitchenware_Dining', 'Kitchenware_Dining', 'キッチン用品', now()),
  (gen_random_uuid()::text, 'Daily_Necessities', 'Daily_Necessities', '日用品', now()),
  (gen_random_uuid()::text, 'Baby_Kids', 'Baby_Kids', 'ベビー・子供', now()),
  (gen_random_uuid()::text, 'Hobby_Entertainment', 'Hobby_Entertainment', '趣味・娯楽', now()),
  (gen_random_uuid()::text, 'Office_Study', 'Office_Study', 'オフィス・学習', now()),
  (gen_random_uuid()::text, 'Tools_DIY', 'Tools_DIY', '工具・DIY', now()),
  (gen_random_uuid()::text, 'Car_Mobility', 'Car_Mobility', '車・移動', now()),
  (gen_random_uuid()::text, 'Starter_Packs', 'Starter_Packs', 'セット', now())
ON CONFLICT (name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- ========== SEED: Sub categories (see seed.sql for full list) ==========
-- Run seed.sql for all sub category inserts, or use: npx prisma db seed
