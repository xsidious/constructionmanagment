const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'admin@test.com';
    const password = 'password123';
    const name = 'Test Admin';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('✅ User already exists:', email);
      console.log('   Password: password123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('✅ Test user created successfully!');
    console.log('   Email:', email);
    console.log('   Password: password123');
    console.log('   Name:', name);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    if (error.code === 'P1001') {
      console.error('   Database connection failed. Make sure PostgreSQL is running.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

