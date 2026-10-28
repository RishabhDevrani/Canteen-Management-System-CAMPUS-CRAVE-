import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const cat1 = await prisma.category.create({
    data: { name: 'Fast Food', description: 'Quick bites' },
  });
  const cat2 = await prisma.category.create({
    data: { name: 'Italian', description: 'Pizza & Pasta' },
  });
  const cat3 = await prisma.category.create({
    data: { name: 'Indian', description: 'Desi flavors' },
  });
  const cat4 = await prisma.category.create({
    data: { name: 'Beverages', description: 'Drinks & Shakes' },
  });

  await prisma.food.createMany({
    data: [
      {
        name: 'Spicy Chicken Burger',
        price: 120,
        categoryId: cat1.id,
        isVeg: false,
        prepTime: 15,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
      },
      {
        name: 'Margherita Pizza',
        price: 250,
        categoryId: cat2.id,
        isVeg: true,
        prepTime: 20,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a30536?auto=format&fit=crop&w=500&q=60',
      },
      {
        name: 'Paneer Tikka Masala',
        price: 180,
        categoryId: cat3.id,
        isVeg: true,
        prepTime: 25,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=60',
      },
      {
        name: 'Cold Coffee',
        price: 80,
        categoryId: cat4.id,
        isVeg: true,
        prepTime: 5,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1461023058943-0708e52235eb?auto=format&fit=crop&w=500&q=60',
      },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
