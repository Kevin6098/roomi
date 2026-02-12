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
LATERAL (VALUES ('bed','bed','ベッド'),('mattress','mattress','マットレス'),('sofa','sofa','ソファ'),('chair','chair','椅子'),('dining_chair','dining_chair','ダイニングチェア'),('desk','desk','デスク'),('table','table','テーブル'),('dining_table','dining_table','食卓'),('coffee_table','coffee_table','コーヒーテーブル'),('shelf','shelf','棚'),('cabinet','cabinet','キャビネット'),('wardrobe','wardrobe','ワードローブ'),('drawer','drawer','引き出し'),('tv_stand','tv_stand','TV台'),('shoe_rack','shoe_rack','靴棚'),('futon','futon','布団'),('kotatsu','kotatsu','こたつ'),('mirror','mirror','鏡'),('curtain','curtain','カーテン'),('rug','rug','ラグ'),('lighting','lighting','照明'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Furniture'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Electronics
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('fridge','fridge','冷蔵庫'),('washing_machine','washing_machine','洗濯機'),('microwave','microwave','電子レンジ'),('tv','tv','テレビ'),('monitor','monitor','モニター'),('speaker','speaker','スピーカー'),('headphones','headphones','ヘッドホン'),('camera','camera','カメラ'),('game_console','game_console','ゲーム機'),('router','router','ルーター'),('printer','printer','プリンター'),('vacuum_robot','vacuum_robot','ロボット掃除機'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Electronics'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Appliance
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('rice_cooker','rice_cooker','炊飯器'),('kettle','kettle','ケトル'),('toaster','toaster','トースター'),('blender','blender','ブレンダー'),('air_fryer','air_fryer','エアフライヤー'),('induction_cooker','induction_cooker','IH調理器'),('heater','heater','ヒーター'),('fan','fan','扇風機'),('air_purifier','air_purifier','空気清浄機'),('dehumidifier','dehumidifier','除湿機'),('vacuum','vacuum','掃除機'),('iron','iron','アイロン'),('hair_dryer','hair_dryer','ドライヤー'),('humidifier','humidifier','加湿器'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Appliance'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Fashion
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('jacket','jacket','ジャケット'),('coat','coat','コート'),('hoodie','hoodie','パーカー'),('tshirt','tshirt','Tシャツ'),('pants','pants','パンツ'),('jeans','jeans','ジーンズ'),('skirt','skirt','スカート'),('dress','dress','ワンピース'),('bag','bag','バッグ'),('backpack','backpack','リュック'),('shoes','shoes','靴'),('sneakers','sneakers','スニーカー'),('boots','boots','ブーツ'),('hat','hat','帽子'),('accessories','accessories','アクセサリー'),('watch','watch','時計'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Fashion'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Bedding_Textiles
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('pillow','pillow','枕'),('blanket','blanket','毛布'),('comforter','comforter','掛け布団'),('bedsheet','bedsheet','シーツ'),('duvet','duvet','羽毛布団'),('towel','towel','タオル'),('mattress_pad','mattress_pad','マットレスパッド'),('curtain','curtain','カーテン'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Bedding_Textiles'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Kitchenware_Dining
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('pot','pot','鍋'),('pan','pan','フライパン'),('knife','knife','包丁'),('cutting_board','cutting_board','まな板'),('dish_set','dish_set','食器セット'),('cup','cup','カップ'),('glass','glass','グラス'),('bento_box','bento_box','弁当箱'),('plates','plates','皿'),('bowls','bowls','丼'),('storage_container','storage_container','保存容器'),('water_bottle','water_bottle','水筒'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Kitchenware_Dining'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Daily_Necessities
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('detergent','detergent','洗剤'),('cleaning_tools','cleaning_tools','掃除用具'),('storage_box','storage_box','収納ボックス'),('hangers','hangers','ハンガー'),('laundry_rack','laundry_rack','物干し'),('trash_bin','trash_bin','ゴミ箱'),('bathroom_items','bathroom_items','バス用品'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Daily_Necessities'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Baby_Kids
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('stroller','stroller','ベビーカー'),('baby_bed','baby_bed','ベビーベッド'),('kids_clothes','kids_clothes','キッズ服'),('toys','toys','おもちゃ'),('baby_chair','baby_chair','ベビーチェア'),('books_kids','books_kids','絵本'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Baby_Kids'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Hobby_Entertainment
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('books','books','本'),('manga','manga','漫画'),('figures','figures','フィギュア'),('board_games','board_games','ボードゲーム'),('musical_instruments','musical_instruments','楽器'),('sports_equipment','sports_equipment','スポーツ用品'),('camping_gear','camping_gear','キャンプ用品'),('bicycle','bicycle','自転車'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Hobby_Entertainment'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Office_Study
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('office_chair','office_chair','オフィスチェア'),('desk_lamp','desk_lamp','デスクランプ'),('stationery','stationery','文房具'),('whiteboard','whiteboard','ホワイトボード'),('bookshelf','bookshelf','本棚'),('monitor_arm','monitor_arm','モニターアーム'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Office_Study'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Tools_DIY
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('toolbox','toolbox','工具箱'),('drill','drill','ドリル'),('screwdriver_set','screwdriver_set','ドライバーセット'),('ladder','ladder','はしご'),('measuring_tools','measuring_tools','計測用具'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Tools_DIY'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Car_Mobility
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('car_accessories','car_accessories','カー用品'),('bike_accessories','bike_accessories','バイク用品'),('scooter','scooter','キックボード'),('helmet','helmet','ヘルメット'),('child_seat','child_seat','チャイルドシート'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Car_Mobility'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";

-- Starter_Packs
INSERT INTO "SubCategory" (id, "mainCategoryId", name, "nameEn", "nameJa", "createdAt")
SELECT gen_random_uuid()::text, m.id, s.name, s."nameEn", s."nameJa", now()
FROM "MainCategory" m,
LATERAL (VALUES ('starter_pack_kitchen','starter_pack_kitchen','キッチンセット'),('starter_pack_room','starter_pack_room','ルームセット'),('bundle_electronics','bundle_electronics','家電セット'),('bundle_furniture','bundle_furniture','家具セット'),('other','other','その他')) AS s(name, "nameEn", "nameJa")
WHERE m.name = 'Starter_Packs'
ON CONFLICT ("mainCategoryId", name) DO UPDATE SET "nameEn" = EXCLUDED."nameEn", "nameJa" = EXCLUDED."nameJa";
