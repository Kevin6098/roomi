import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/services/auth.service.js';

const prisma = new PrismaClient();

// ROOMI Japan focused: Main (nameEn / nameJa) + Sub categories. Each main ends with "other".
const MAIN_SUBS: { nameEn: string; nameJa: string; subs: string[] }[] = [
  { nameEn: 'Furniture', nameJa: '家具', subs: ['bed', 'mattress', 'sofa', 'chair', 'dining_chair', 'desk', 'table', 'dining_table', 'coffee_table', 'shelf', 'cabinet', 'wardrobe', 'drawer', 'tv_stand', 'shoe_rack', 'futon', 'kotatsu', 'mirror', 'curtain', 'rug', 'lighting', 'other'] },
  { nameEn: 'Electronics', nameJa: '電子機器', subs: ['fridge', 'washing_machine', 'microwave', 'tv', 'monitor', 'speaker', 'headphones', 'camera', 'game_console', 'router', 'printer', 'vacuum_robot', 'other'] },
  { nameEn: 'Appliance', nameJa: '家電', subs: ['rice_cooker', 'kettle', 'toaster', 'blender', 'air_fryer', 'induction_cooker', 'heater', 'fan', 'air_purifier', 'dehumidifier', 'vacuum', 'iron', 'hair_dryer', 'humidifier', 'other'] },
  { nameEn: 'Fashion', nameJa: 'ファッション', subs: ['jacket', 'coat', 'hoodie', 'tshirt', 'pants', 'jeans', 'skirt', 'dress', 'bag', 'backpack', 'shoes', 'sneakers', 'boots', 'hat', 'accessories', 'watch', 'other'] },
  { nameEn: 'Bedding_Textiles', nameJa: '寝具・布類', subs: ['pillow', 'blanket', 'comforter', 'bedsheet', 'duvet', 'towel', 'mattress_pad', 'curtain', 'other'] },
  { nameEn: 'Kitchenware_Dining', nameJa: 'キッチン用品', subs: ['pot', 'pan', 'knife', 'cutting_board', 'dish_set', 'cup', 'glass', 'bento_box', 'plates', 'bowls', 'storage_container', 'water_bottle', 'other'] },
  { nameEn: 'Daily_Necessities', nameJa: '日用品', subs: ['detergent', 'cleaning_tools', 'storage_box', 'hangers', 'laundry_rack', 'trash_bin', 'bathroom_items', 'other'] },
  { nameEn: 'Baby_Kids', nameJa: 'ベビー・子供', subs: ['stroller', 'baby_bed', 'kids_clothes', 'toys', 'baby_chair', 'books_kids', 'other'] },
  { nameEn: 'Hobby_Entertainment', nameJa: '趣味・娯楽', subs: ['books', 'manga', 'figures', 'board_games', 'musical_instruments', 'sports_equipment', 'camping_gear', 'bicycle', 'other'] },
  { nameEn: 'Office_Study', nameJa: 'オフィス・学習', subs: ['office_chair', 'desk_lamp', 'stationery', 'whiteboard', 'bookshelf', 'monitor_arm', 'other'] },
  { nameEn: 'Tools_DIY', nameJa: '工具・DIY', subs: ['toolbox', 'drill', 'screwdriver_set', 'ladder', 'measuring_tools', 'other'] },
  { nameEn: 'Car_Mobility', nameJa: '車・移動', subs: ['car_accessories', 'bike_accessories', 'scooter', 'helmet', 'child_seat', 'other'] },
  { nameEn: 'Starter_Packs', nameJa: 'セット', subs: ['starter_pack_kitchen', 'starter_pack_room', 'bundle_electronics', 'bundle_furniture', 'other'] },
];

const ADMIN_EMAIL = 'admin@roomi.local';
const ADMIN_PASSWORD = 'admin123';

async function main() {
  const adminHash = await hashPassword(ADMIN_PASSWORD);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: { email: ADMIN_EMAIL, passwordHash: adminHash, role: 'OWNER' },
    update: {},
  });
  console.log(`Admin user: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);

  for (const { nameEn, nameJa, subs } of MAIN_SUBS) {
    const main = await prisma.mainCategory.upsert({
      where: { name: nameEn },
      create: { name: nameEn, nameEn, nameJa },
      update: { nameEn, nameJa },
    });
    for (const subName of subs) {
      const nameJaSub = subName === 'other' ? 'その他' : subName;
      await prisma.subCategory.upsert({
        where: { mainCategoryId_name: { mainCategoryId: main.id, name: subName } },
        create: { mainCategoryId: main.id, name: subName, nameEn: subName, nameJa: nameJaSub },
        update: { nameEn: subName, nameJa: nameJaSub },
      });
    }
    console.log(`Category: ${nameEn} / ${nameJa} (+ ${subs.length} sub)`);
  }
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
