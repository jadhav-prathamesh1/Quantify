const { PrismaClient } = require('@prisma/client');

async function seedDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Seeding database...');

    // Check if we already have stores
    const existingStores = await prisma.store.count();
    if (existingStores > 0) {
      console.log('✅ Database already has stores, skipping seed...');
      return;
    }

    // Create some test stores
    const stores = await prisma.store.createMany({
      data: [
        {
          name: "Coffee Paradise",
          category: "Restaurant",
          address: "123 Main St, Downtown",
          phone: "+1-555-0101",
          email: "info@coffeeparadise.com",
          description: "Best coffee in town with amazing pastries"
        },
        {
          name: "Tech Gadgets Store",
          category: "Retail",
          address: "456 Tech Ave, Silicon Valley",
          phone: "+1-555-0102",
          email: "sales@techgadgets.com",
          description: "Latest technology and gadgets"
        },
        {
          name: "Healthy Bites",
          category: "Restaurant",
          address: "789 Green St, Organic Plaza",
          phone: "+1-555-0103",
          email: "hello@healthybites.com",
          description: "Organic and healthy food options"
        },
        {
          name: "Fashion Hub",
          category: "Retail",
          address: "321 Style Blvd, Fashion District",
          phone: "+1-555-0104",
          email: "contact@fashionhub.com",
          description: "Trendy clothing and accessories"
        },
        {
          name: "Quick Repair Services",
          category: "Service",
          address: "654 Fix It Lane, Service Center",
          phone: "+1-555-0105",
          email: "repair@quickfix.com",
          description: "Fast and reliable repair services"
        }
      ]
    });
    
    console.log(`✅ Created ${stores.count} stores`);

    // Add some sample reviews for the existing user (id: 2)
    const storeRecords = await prisma.store.findMany({ take: 3 });
    
    const reviews = await prisma.rating.createMany({
      data: [
        {
          userId: 2,
          storeId: storeRecords[0].id,
          rating: 5,
          comment: "Amazing coffee and great atmosphere!"
        },
        {
          userId: 2,
          storeId: storeRecords[1].id,
          rating: 4,
          comment: "Good selection of tech products, helpful staff."
        },
        {
          userId: 2,
          storeId: storeRecords[2].id,
          rating: 5,
          comment: "Love the healthy options here!"
        }
      ]
    });
    
    console.log(`✅ Created ${reviews.count} reviews`);
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
