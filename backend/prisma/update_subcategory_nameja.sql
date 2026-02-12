-- Update SubCategory "nameJa" (and "nameEn") for Japanese display
-- Run this in PostgreSQL (e.g. pgAdmin, psql) against your ROOMI database.
-- Safe: only updates existing rows matched by main category name + subcategory name.

-- Furniture
UPDATE "SubCategory" SET "nameEn" = 'bed', "nameJa" = 'ベッド' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'bed';
UPDATE "SubCategory" SET "nameEn" = 'mattress', "nameJa" = 'マットレス' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'mattress';
UPDATE "SubCategory" SET "nameEn" = 'sofa', "nameJa" = 'ソファ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'sofa';
UPDATE "SubCategory" SET "nameEn" = 'chair', "nameJa" = '椅子' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'chair';
UPDATE "SubCategory" SET "nameEn" = 'dining_chair', "nameJa" = 'ダイニングチェア' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'dining_chair';
UPDATE "SubCategory" SET "nameEn" = 'desk', "nameJa" = 'デスク' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'desk';
UPDATE "SubCategory" SET "nameEn" = 'table', "nameJa" = 'テーブル' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'table';
UPDATE "SubCategory" SET "nameEn" = 'dining_table', "nameJa" = '食卓' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'dining_table';
UPDATE "SubCategory" SET "nameEn" = 'coffee_table', "nameJa" = 'コーヒーテーブル' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'coffee_table';
UPDATE "SubCategory" SET "nameEn" = 'shelf', "nameJa" = '棚' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'shelf';
UPDATE "SubCategory" SET "nameEn" = 'cabinet', "nameJa" = 'キャビネット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'cabinet';
UPDATE "SubCategory" SET "nameEn" = 'wardrobe', "nameJa" = 'ワードローブ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'wardrobe';
UPDATE "SubCategory" SET "nameEn" = 'drawer', "nameJa" = '引き出し' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'drawer';
UPDATE "SubCategory" SET "nameEn" = 'tv_stand', "nameJa" = 'TV台' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'tv_stand';
UPDATE "SubCategory" SET "nameEn" = 'shoe_rack', "nameJa" = '靴棚' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'shoe_rack';
UPDATE "SubCategory" SET "nameEn" = 'futon', "nameJa" = '布団' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'futon';
UPDATE "SubCategory" SET "nameEn" = 'kotatsu', "nameJa" = 'こたつ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'kotatsu';
UPDATE "SubCategory" SET "nameEn" = 'mirror', "nameJa" = '鏡' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'mirror';
UPDATE "SubCategory" SET "nameEn" = 'curtain', "nameJa" = 'カーテン' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'curtain';
UPDATE "SubCategory" SET "nameEn" = 'rug', "nameJa" = 'ラグ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'rug';
UPDATE "SubCategory" SET "nameEn" = 'lighting', "nameJa" = '照明' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'lighting';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Furniture') AND name = 'other';

-- Electronics
UPDATE "SubCategory" SET "nameEn" = 'fridge', "nameJa" = '冷蔵庫' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'fridge';
UPDATE "SubCategory" SET "nameEn" = 'washing_machine', "nameJa" = '洗濯機' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'washing_machine';
UPDATE "SubCategory" SET "nameEn" = 'microwave', "nameJa" = '電子レンジ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'microwave';
UPDATE "SubCategory" SET "nameEn" = 'tv', "nameJa" = 'テレビ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'tv';
UPDATE "SubCategory" SET "nameEn" = 'monitor', "nameJa" = 'モニター' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'monitor';
UPDATE "SubCategory" SET "nameEn" = 'speaker', "nameJa" = 'スピーカー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'speaker';
UPDATE "SubCategory" SET "nameEn" = 'headphones', "nameJa" = 'ヘッドホン' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'headphones';
UPDATE "SubCategory" SET "nameEn" = 'camera', "nameJa" = 'カメラ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'camera';
UPDATE "SubCategory" SET "nameEn" = 'game_console', "nameJa" = 'ゲーム機' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'game_console';
UPDATE "SubCategory" SET "nameEn" = 'router', "nameJa" = 'ルーター' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'router';
UPDATE "SubCategory" SET "nameEn" = 'printer', "nameJa" = 'プリンター' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'printer';
UPDATE "SubCategory" SET "nameEn" = 'vacuum_robot', "nameJa" = 'ロボット掃除機' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'vacuum_robot';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Electronics') AND name = 'other';

-- Appliance
UPDATE "SubCategory" SET "nameEn" = 'rice_cooker', "nameJa" = '炊飯器' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'rice_cooker';
UPDATE "SubCategory" SET "nameEn" = 'kettle', "nameJa" = 'ケトル' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'kettle';
UPDATE "SubCategory" SET "nameEn" = 'toaster', "nameJa" = 'トースター' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'toaster';
UPDATE "SubCategory" SET "nameEn" = 'blender', "nameJa" = 'ブレンダー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'blender';
UPDATE "SubCategory" SET "nameEn" = 'air_fryer', "nameJa" = 'エアフライヤー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'air_fryer';
UPDATE "SubCategory" SET "nameEn" = 'induction_cooker', "nameJa" = 'IH調理器' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'induction_cooker';
UPDATE "SubCategory" SET "nameEn" = 'heater', "nameJa" = 'ヒーター' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'heater';
UPDATE "SubCategory" SET "nameEn" = 'fan', "nameJa" = '扇風機' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'fan';
UPDATE "SubCategory" SET "nameEn" = 'air_purifier', "nameJa" = '空気清浄機' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'air_purifier';
UPDATE "SubCategory" SET "nameEn" = 'dehumidifier', "nameJa" = '除湿機' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'dehumidifier';
UPDATE "SubCategory" SET "nameEn" = 'vacuum', "nameJa" = '掃除機' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'vacuum';
UPDATE "SubCategory" SET "nameEn" = 'iron', "nameJa" = 'アイロン' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'iron';
UPDATE "SubCategory" SET "nameEn" = 'hair_dryer', "nameJa" = 'ドライヤー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'hair_dryer';
UPDATE "SubCategory" SET "nameEn" = 'humidifier', "nameJa" = '加湿器' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'humidifier';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Appliance') AND name = 'other';

-- Fashion
UPDATE "SubCategory" SET "nameEn" = 'jacket', "nameJa" = 'ジャケット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'jacket';
UPDATE "SubCategory" SET "nameEn" = 'coat', "nameJa" = 'コート' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'coat';
UPDATE "SubCategory" SET "nameEn" = 'hoodie', "nameJa" = 'パーカー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'hoodie';
UPDATE "SubCategory" SET "nameEn" = 'tshirt', "nameJa" = 'Tシャツ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'tshirt';
UPDATE "SubCategory" SET "nameEn" = 'pants', "nameJa" = 'パンツ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'pants';
UPDATE "SubCategory" SET "nameEn" = 'jeans', "nameJa" = 'ジーンズ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'jeans';
UPDATE "SubCategory" SET "nameEn" = 'skirt', "nameJa" = 'スカート' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'skirt';
UPDATE "SubCategory" SET "nameEn" = 'dress', "nameJa" = 'ワンピース' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'dress';
UPDATE "SubCategory" SET "nameEn" = 'bag', "nameJa" = 'バッグ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'bag';
UPDATE "SubCategory" SET "nameEn" = 'backpack', "nameJa" = 'リュック' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'backpack';
UPDATE "SubCategory" SET "nameEn" = 'shoes', "nameJa" = '靴' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'shoes';
UPDATE "SubCategory" SET "nameEn" = 'sneakers', "nameJa" = 'スニーカー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'sneakers';
UPDATE "SubCategory" SET "nameEn" = 'boots', "nameJa" = 'ブーツ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'boots';
UPDATE "SubCategory" SET "nameEn" = 'hat', "nameJa" = '帽子' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'hat';
UPDATE "SubCategory" SET "nameEn" = 'accessories', "nameJa" = 'アクセサリー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'accessories';
UPDATE "SubCategory" SET "nameEn" = 'watch', "nameJa" = '時計' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'watch';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Fashion') AND name = 'other';

-- Bedding_Textiles
UPDATE "SubCategory" SET "nameEn" = 'pillow', "nameJa" = '枕' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'pillow';
UPDATE "SubCategory" SET "nameEn" = 'blanket', "nameJa" = '毛布' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'blanket';
UPDATE "SubCategory" SET "nameEn" = 'comforter', "nameJa" = '掛け布団' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'comforter';
UPDATE "SubCategory" SET "nameEn" = 'bedsheet', "nameJa" = 'シーツ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'bedsheet';
UPDATE "SubCategory" SET "nameEn" = 'duvet', "nameJa" = '羽毛布団' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'duvet';
UPDATE "SubCategory" SET "nameEn" = 'towel', "nameJa" = 'タオル' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'towel';
UPDATE "SubCategory" SET "nameEn" = 'mattress_pad', "nameJa" = 'マットレスパッド' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'mattress_pad';
UPDATE "SubCategory" SET "nameEn" = 'curtain', "nameJa" = 'カーテン' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'curtain';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Bedding_Textiles') AND name = 'other';

-- Kitchenware_Dining
UPDATE "SubCategory" SET "nameEn" = 'pot', "nameJa" = '鍋' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'pot';
UPDATE "SubCategory" SET "nameEn" = 'pan', "nameJa" = 'フライパン' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'pan';
UPDATE "SubCategory" SET "nameEn" = 'knife', "nameJa" = '包丁' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'knife';
UPDATE "SubCategory" SET "nameEn" = 'cutting_board', "nameJa" = 'まな板' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'cutting_board';
UPDATE "SubCategory" SET "nameEn" = 'dish_set', "nameJa" = '食器セット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'dish_set';
UPDATE "SubCategory" SET "nameEn" = 'cup', "nameJa" = 'カップ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'cup';
UPDATE "SubCategory" SET "nameEn" = 'glass', "nameJa" = 'グラス' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'glass';
UPDATE "SubCategory" SET "nameEn" = 'bento_box', "nameJa" = '弁当箱' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'bento_box';
UPDATE "SubCategory" SET "nameEn" = 'plates', "nameJa" = '皿' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'plates';
UPDATE "SubCategory" SET "nameEn" = 'bowls', "nameJa" = '丼' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'bowls';
UPDATE "SubCategory" SET "nameEn" = 'storage_container', "nameJa" = '保存容器' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'storage_container';
UPDATE "SubCategory" SET "nameEn" = 'water_bottle', "nameJa" = '水筒' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'water_bottle';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Kitchenware_Dining') AND name = 'other';

-- Daily_Necessities
UPDATE "SubCategory" SET "nameEn" = 'detergent', "nameJa" = '洗剤' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'detergent';
UPDATE "SubCategory" SET "nameEn" = 'cleaning_tools', "nameJa" = '掃除用具' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'cleaning_tools';
UPDATE "SubCategory" SET "nameEn" = 'storage_box', "nameJa" = '収納ボックス' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'storage_box';
UPDATE "SubCategory" SET "nameEn" = 'hangers', "nameJa" = 'ハンガー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'hangers';
UPDATE "SubCategory" SET "nameEn" = 'laundry_rack', "nameJa" = '物干し' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'laundry_rack';
UPDATE "SubCategory" SET "nameEn" = 'trash_bin', "nameJa" = 'ゴミ箱' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'trash_bin';
UPDATE "SubCategory" SET "nameEn" = 'bathroom_items', "nameJa" = 'バス用品' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'bathroom_items';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Daily_Necessities') AND name = 'other';

-- Baby_Kids
UPDATE "SubCategory" SET "nameEn" = 'stroller', "nameJa" = 'ベビーカー' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Baby_Kids') AND name = 'stroller';
UPDATE "SubCategory" SET "nameEn" = 'baby_bed', "nameJa" = 'ベビーベッド' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Baby_Kids') AND name = 'baby_bed';
UPDATE "SubCategory" SET "nameEn" = 'kids_clothes', "nameJa" = 'キッズ服' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Baby_Kids') AND name = 'kids_clothes';
UPDATE "SubCategory" SET "nameEn" = 'toys', "nameJa" = 'おもちゃ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Baby_Kids') AND name = 'toys';
UPDATE "SubCategory" SET "nameEn" = 'baby_chair', "nameJa" = 'ベビーチェア' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Baby_Kids') AND name = 'baby_chair';
UPDATE "SubCategory" SET "nameEn" = 'books_kids', "nameJa" = '絵本' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Baby_Kids') AND name = 'books_kids';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Baby_Kids') AND name = 'other';

-- Hobby_Entertainment
UPDATE "SubCategory" SET "nameEn" = 'books', "nameJa" = '本' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'books';
UPDATE "SubCategory" SET "nameEn" = 'manga', "nameJa" = '漫画' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'manga';
UPDATE "SubCategory" SET "nameEn" = 'figures', "nameJa" = 'フィギュア' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'figures';
UPDATE "SubCategory" SET "nameEn" = 'board_games', "nameJa" = 'ボードゲーム' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'board_games';
UPDATE "SubCategory" SET "nameEn" = 'musical_instruments', "nameJa" = '楽器' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'musical_instruments';
UPDATE "SubCategory" SET "nameEn" = 'sports_equipment', "nameJa" = 'スポーツ用品' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'sports_equipment';
UPDATE "SubCategory" SET "nameEn" = 'camping_gear', "nameJa" = 'キャンプ用品' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'camping_gear';
UPDATE "SubCategory" SET "nameEn" = 'bicycle', "nameJa" = '自転車' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'bicycle';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Hobby_Entertainment') AND name = 'other';

-- Office_Study
UPDATE "SubCategory" SET "nameEn" = 'office_chair', "nameJa" = 'オフィスチェア' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Office_Study') AND name = 'office_chair';
UPDATE "SubCategory" SET "nameEn" = 'desk_lamp', "nameJa" = 'デスクランプ' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Office_Study') AND name = 'desk_lamp';
UPDATE "SubCategory" SET "nameEn" = 'stationery', "nameJa" = '文房具' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Office_Study') AND name = 'stationery';
UPDATE "SubCategory" SET "nameEn" = 'whiteboard', "nameJa" = 'ホワイトボード' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Office_Study') AND name = 'whiteboard';
UPDATE "SubCategory" SET "nameEn" = 'bookshelf', "nameJa" = '本棚' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Office_Study') AND name = 'bookshelf';
UPDATE "SubCategory" SET "nameEn" = 'monitor_arm', "nameJa" = 'モニターアーム' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Office_Study') AND name = 'monitor_arm';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Office_Study') AND name = 'other';

-- Tools_DIY
UPDATE "SubCategory" SET "nameEn" = 'toolbox', "nameJa" = '工具箱' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Tools_DIY') AND name = 'toolbox';
UPDATE "SubCategory" SET "nameEn" = 'drill', "nameJa" = 'ドリル' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Tools_DIY') AND name = 'drill';
UPDATE "SubCategory" SET "nameEn" = 'screwdriver_set', "nameJa" = 'ドライバーセット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Tools_DIY') AND name = 'screwdriver_set';
UPDATE "SubCategory" SET "nameEn" = 'ladder', "nameJa" = 'はしご' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Tools_DIY') AND name = 'ladder';
UPDATE "SubCategory" SET "nameEn" = 'measuring_tools', "nameJa" = '計測用具' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Tools_DIY') AND name = 'measuring_tools';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Tools_DIY') AND name = 'other';

-- Car_Mobility
UPDATE "SubCategory" SET "nameEn" = 'car_accessories', "nameJa" = 'カー用品' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Car_Mobility') AND name = 'car_accessories';
UPDATE "SubCategory" SET "nameEn" = 'bike_accessories', "nameJa" = 'バイク用品' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Car_Mobility') AND name = 'bike_accessories';
UPDATE "SubCategory" SET "nameEn" = 'scooter', "nameJa" = 'キックボード' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Car_Mobility') AND name = 'scooter';
UPDATE "SubCategory" SET "nameEn" = 'helmet', "nameJa" = 'ヘルメット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Car_Mobility') AND name = 'helmet';
UPDATE "SubCategory" SET "nameEn" = 'child_seat', "nameJa" = 'チャイルドシート' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Car_Mobility') AND name = 'child_seat';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Car_Mobility') AND name = 'other';

-- Starter_Packs
UPDATE "SubCategory" SET "nameEn" = 'starter_pack_kitchen', "nameJa" = 'キッチンセット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Starter_Packs') AND name = 'starter_pack_kitchen';
UPDATE "SubCategory" SET "nameEn" = 'starter_pack_room', "nameJa" = 'ルームセット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Starter_Packs') AND name = 'starter_pack_room';
UPDATE "SubCategory" SET "nameEn" = 'bundle_electronics', "nameJa" = '家電セット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Starter_Packs') AND name = 'bundle_electronics';
UPDATE "SubCategory" SET "nameEn" = 'bundle_furniture', "nameJa" = '家具セット' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Starter_Packs') AND name = 'bundle_furniture';
UPDATE "SubCategory" SET "nameEn" = 'other', "nameJa" = 'その他' WHERE "mainCategoryId" = (SELECT id FROM "MainCategory" WHERE name = 'Starter_Packs') AND name = 'other';
