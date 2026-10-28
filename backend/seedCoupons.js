import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding coupons...');

  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2); // Valid for 2 years

  await prisma.coupon.upsert({
    where: { code: 'CAMPUS20' },
    update: {
      value: 20,
      minOrderValue: 100,
      expiryDate: futureDate,
    },
    create: {
      code: 'CAMPUS20',
      discountType: 'PERCENTAGE',
      value: 20,
      minOrderValue: 100,
      expiryDate: futureDate,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FLAT50' },
    update: {
      value: 50,
      minOrderValue: 150,
      expiryDate: futureDate,
    },
    create: {
      code: 'FLAT50',
      discountType: 'FLAT',
      value: 50,
      minOrderValue: 150,
      expiryDate: futureDate,
    },
  });

  console.log('Coupons seeded successfully: CAMPUS20, FLAT50');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
