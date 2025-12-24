const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
    });
    
    if (user) {
      console.log('✅ User found!');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      
      // Test password
      const testPassword = 'password123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('   Password test:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\n🔧 Fixing password...');
        const hash = await bcrypt.hash(testPassword, 12);
        await prisma.user.update({
          where: { email: user.email },
          data: { password: hash },
        });
        console.log('✅ Password fixed!');
      }
    } else {
      console.log('❌ User not found!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('   Database connection failed!');
      console.error('   Make sure DATABASE_URL in .env.local is correct.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

