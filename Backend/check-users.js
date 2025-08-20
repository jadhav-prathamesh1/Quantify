const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Users in database:', JSON.stringify(users, null, 2));
    
    if (users.length === 0) {
      console.log('\nNo users found. Creating a test user...');
      
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'hashedpassword123',
          role: 'USER',
          status: 'ACTIVE'
        }
      });
      console.log('Test user created:', JSON.stringify(testUser, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
