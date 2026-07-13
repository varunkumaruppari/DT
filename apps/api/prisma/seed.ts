import { seedAchievements } from '../src/services/achievements.service.js';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  console.log('🌱 Seeding database achievements...');
  await seedAchievements();
  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
