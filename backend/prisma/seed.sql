-- ROOMI Japan category seed (safe: no duplicates)
-- Run after migrations. Uses ON CONFLICT to skip or update existing rows.

-- Main categories (upsert by unique name)
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

-- Sub categories: insert per main (safe upsert by mainCategoryId + name)
-- Furniture
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('bed','bed','bed'),('mattress','mattress','mattress'),('sofa','sofa','sofa'),('chair','chair','chair'),('dining_chair','dining_chair','dining_chair'),('desk','desk','desk'),('table','table','table'),('dining_table','dining_table','dining_table'),('coffee_table','coffee_table','coffee_table'),('shelf','shelf','shelf'),('cabinet','cabinet','cabinet'),('wardrobe','wardrobe','wardrobe'),('drawer','drawer','drawer'),('tv_stand','tv_stand','tv_stand'),('shoe_rack','shoe_rack','shoe_rack'),('futon','futon','futon'),('kotatsu','kotatsu','kotatsu'),('mirror','mirror','mirror'),('curtain','curtain','curtain'),('rug','rug','rug'),('lighting','lighting','lighting'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Furniture'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Electronics
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('fridge','fridge','fridge'),('washing_machine','washing_machine','washing_machine'),('microwave','microwave','microwave'),('tv','tv','tv'),('monitor','monitor','monitor'),('speaker','speaker','speaker'),('headphones','headphones','headphones'),('camera','camera','camera'),('game_console','game_console','game_console'),('router','router','router'),('printer','printer','printer'),('vacuum_robot','vacuum_robot','vacuum_robot'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Electronics'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Appliance
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('rice_cooker','rice_cooker','rice_cooker'),('kettle','kettle','kettle'),('toaster','toaster','toaster'),('blender','blender','blender'),('air_fryer','air_fryer','air_fryer'),('induction_cooker','induction_cooker','induction_cooker'),('heater','heater','heater'),('fan','fan','fan'),('air_purifier','air_purifier','air_purifier'),('dehumidifier','dehumidifier','dehumidifier'),('vacuum','vacuum','vacuum'),('iron','iron','iron'),('hair_dryer','hair_dryer','hair_dryer'),('humidifier','humidifier','humidifier'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Appliance'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Fashion
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('jacket','jacket','jacket'),('coat','coat','coat'),('hoodie','hoodie','hoodie'),('tshirt','tshirt','tshirt'),('pants','pants','pants'),('jeans','jeans','jeans'),('skirt','skirt','skirt'),('dress','dress','dress'),('bag','bag','bag'),('backpack','backpack','backpack'),('shoes','shoes','shoes'),('sneakers','sneakers','sneakers'),('boots','boots','boots'),('hat','hat','hat'),('accessories','accessories','accessories'),('watch','watch','watch'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Fashion'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Bedding_Textiles
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('pillow','pillow','pillow'),('blanket','blanket','blanket'),('comforter','comforter','comforter'),('bedsheet','bedsheet','bedsheet'),('duvet','duvet','duvet'),('towel','towel','towel'),('mattress_pad','mattress_pad','mattress_pad'),('curtain','curtain','curtain'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Bedding_Textiles'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Kitchenware_Dining
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('pot','pot','pot'),('pan','pan','pan'),('knife','knife','knife'),('cutting_board','cutting_board','cutting_board'),('dish_set','dish_set','dish_set'),('cup','cup','cup'),('glass','glass','glass'),('bento_box','bento_box','bento_box'),('plates','plates','plates'),('bowls','bowls','bowls'),('storage_container','storage_container','storage_container'),('water_bottle','water_bottle','water_bottle'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Kitchenware_Dining'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Daily_Necessities
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('detergent','detergent','detergent'),('cleaning_tools','cleaning_tools','cleaning_tools'),('storage_box','storage_box','storage_box'),('hangers','hangers','hangers'),('laundry_rack','laundry_rack','laundry_rack'),('trash_bin','trash_bin','trash_bin'),('bathroom_items','bathroom_items','bathroom_items'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Daily_Necessities'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Baby_Kids
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('stroller','stroller','stroller'),('baby_bed','baby_bed','baby_bed'),('kids_clothes','kids_clothes','kids_clothes'),('toys','toys','toys'),('baby_chair','baby_chair','baby_chair'),('books_kids','books_kids','books_kids'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Baby_Kids'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Hobby_Entertainment
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('books','books','books'),('manga','manga','manga'),('figures','figures','figures'),('board_games','board_games','board_games'),('musical_instruments','musical_instruments','musical_instruments'),('sports_equipment','sports_equipment','sports_equipment'),('camping_gear','camping_gear','camping_gear'),('bicycle','bicycle','bicycle'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Hobby_Entertainment'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Office_Study
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('office_chair','office_chair','office_chair'),('desk_lamp','desk_lamp','desk_lamp'),('stationery','stationery','stationery'),('whiteboard','whiteboard','whiteboard'),('bookshelf','bookshelf','bookshelf'),('monitor_arm','monitor_arm','monitor_arm'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Office_Study'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Tools_DIY
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('toolbox','toolbox','toolbox'),('drill','drill','drill'),('screwdriver_set','screwdriver_set','screwdriver_set'),('ladder','ladder','ladder'),('measuring_tools','measuring_tools','measuring_tools'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Tools_DIY'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Car_Mobility
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('car_accessories','car_accessories','car_accessories'),('bike_accessories','bike_accessories','bike_accessories'),('scooter','scooter','scooter'),('helmet','helmet','helmet'),('child_seat','child_seat','child_seat'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Car_Mobility'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Starter_Packs
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('starter_pack_kitchen','starter_pack_kitchen','starter_pack_kitchen'),('starter_pack_room','starter_pack_room','starter_pack_room'),('bundle_electronics','bundle_electronics','bundle_electronics'),('bundle_furniture','bundle_furniture','bundle_furniture'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Starter_Packs'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";
