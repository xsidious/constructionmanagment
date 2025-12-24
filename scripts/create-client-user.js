const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating client user...');

  const args = process.argv.slice(2);
  const email = args[0] || 'client@example.com';
  const password = args[1] || 'client123';
  const name = args[2] || 'Client User';
  const customerEmail = args[3] || email; // Customer email to link to

  // Check if customer exists
  const customer = await prisma.customer.findFirst({
    where: { email: customerEmail },
  });

  if (!customer) {
    console.error('❌ Customer not found with email:', customerEmail);
    console.log('💡 Please create a customer first with this email address');
    process.exit(1);
  }

  console.log('✅ Found customer:', customer.name);

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
    },
    create: {
      email,
      password: hashedPassword,
      name,
    },
  });

  console.log('✅ Created/updated user:', user.email);

  // Create company membership with Client role
  // First, get the company from the customer
  const company = await prisma.company.findUnique({
    where: { id: customer.companyId },
  });

  if (!company) {
    console.error('❌ Company not found');
    process.exit(1);
  }

  // Create membership
  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: company.id,
      },
    },
    update: {
      role: 'Client',
    },
    create: {
      userId: user.id,
      companyId: company.id,
      role: 'Client',
    },
  });

  console.log('✅ Created client membership');
  console.log('\n🎉 Client user created successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Email:', email);
  console.log('   Password:', password);
  console.log('   Role: Client');
  console.log('   Linked to customer:', customer.name);
  console.log('\n💡 The client can now log in and view their projects at /client');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

