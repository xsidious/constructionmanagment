const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixTestUser() {
  try {
    const email = 'admin@test.com';
    const password = 'password123';
    
    console.log('Checking user...');
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('User exists, checking password...');
      const isValid = await bcrypt.compare(password, existing.password);
      console.log('Password valid:', isValid);
      
      if (!isValid) {
        console.log('Password is invalid, updating...');
        const hash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email },
          data: { password: hash },
        });
        console.log('✅ Password updated!');
      } else {
        console.log('✅ Password is already correct!');
      }
    } else {
      console.log('User does not exist, creating...');
      const hash = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: {
          email,
          password: hash,
          name: 'Test Admin',
        },
      });
      console.log('✅ User created!');
    }
    
    console.log('\n📋 Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password: password123');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('   Database connection failed. Make sure PostgreSQL is running.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixTestUser();

