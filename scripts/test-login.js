const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'admin@test.com';
    const password = 'password123';
    
    console.log('Testing login...');
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('❌ User not found! Creating user...');
      const hash = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: {
          email,
          password: hash,
          name: 'Test Admin',
        },
      });
      console.log('✅ User created!');
    } else {
      console.log('✅ User found!');
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        console.log('✅ Password is correct!');
      } else {
        console.log('❌ Password is incorrect! Updating...');
        const hash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email },
          data: { password: hash },
        });
        console.log('✅ Password updated!');
      }
    }
    
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@test.com');
    console.log('   Password: password123');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

