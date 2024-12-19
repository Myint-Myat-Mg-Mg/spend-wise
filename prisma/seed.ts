// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultCategories = [
    { name: 'Shopping', private: false },
    { name: 'Subscription', private: false },
    { name: 'Food', private: false },
    { name: 'Salary', private: false },
    { name: 'Transportation', private: false },
    { name: 'General Use', private: false },
    { name: 'Loan', private: false },
    { name: 'Borrow', private: false },
  ];

  await prisma.category.createMany({
    data: defaultCategories,
    skipDuplicates: true, // Avoid recreating existing categories
  });

  console.log('Default categories seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
