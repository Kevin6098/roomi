import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/services/auth.service.js';

const prisma = new PrismaClient();

const MAIN_SUBS: { name: string; subs: string[] }[] = [
  { name: 'Furniture', subs: ['bed', 'desk', 'sofa', 'chair', 'table', 'other'] },
  { name: 'Electronics', subs: ['fridge', 'washing_machine', 'microwave', 'tv'] },
  { name: 'Fashion', subs: ['jacket', 'shoes', 'bag'] },
  { name: 'Appliance', subs: ['rice_cooker', 'kettle', 'vacuum'] },
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

  for (const { name: mainName, subs } of MAIN_SUBS) {
    const main = await prisma.mainCategory.upsert({
      where: { name: mainName },
      create: { name: mainName, nameEn: mainName, nameJa: mainName },
      update: { nameEn: mainName, nameJa: mainName },
    });
    for (const subName of subs) {
      await prisma.subCategory.upsert({
        where: { mainCategoryId_name: { mainCategoryId: main.id, name: subName } },
        create: { mainCategoryId: main.id, name: subName, nameEn: subName, nameJa: subName },
        update: { nameEn: subName, nameJa: subName },
      });
    }
    console.log(`Category: ${mainName} (+ ${subs.length} sub)`);
  }
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
