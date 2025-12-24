const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating users...\n');

  // Get or create company
  const company = await prisma.company.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Construction Company',
      slug: 'demo-company',
      currency: 'USD',
    },
  });

  console.log('✅ Company ready:', company.name);

  // 1. Create Admin User
  console.log('\n👤 Creating Admin User...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      password: adminPassword,
      name: 'Admin User',
    },
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      name: 'Admin User',
    },
  });

  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: adminUser.id,
        companyId: company.id,
      },
    },
    update: {
      role: 'Admin',
    },
    create: {
      userId: adminUser.id,
      companyId: company.id,
      role: 'Admin',
    },
  });

  console.log('✅ Admin user created');
  console.log('   Email: admin@test.com');
  console.log('   Password: admin123');
  console.log('   Role: Admin');

  // 2. Create Client User
  console.log('\n👥 Creating Client User...');
  
  // First create a customer for the client
  let customer = await prisma.customer.findFirst({
    where: {
      companyId: company.id,
      email: 'client@test.com',
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        name: 'Client User',
        email: 'client@test.com',
        phone: '+1234567890',
        address: '123 Client Street',
      },
    });
  }

  console.log('✅ Customer created:', customer.name);

  const clientPassword = await bcrypt.hash('client123', 12);
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {
      password: clientPassword,
      name: 'Client User',
    },
    create: {
      email: 'client@test.com',
      password: clientPassword,
      name: 'Client User',
    },
  });

  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: clientUser.id,
        companyId: company.id,
      },
    },
    update: {
      role: 'Client',
    },
    create: {
      userId: clientUser.id,
      companyId: company.id,
      role: 'Client',
    },
  });

  console.log('✅ Client user created');
  console.log('   Email: client@test.com');
  console.log('   Password: client123');
  console.log('   Role: Client');
  console.log('   Linked to customer:', customer.name);

  // 3. Create Contractor User (Worker role)
  console.log('\n🔧 Creating Contractor User...');
  const contractorPassword = await bcrypt.hash('contractor123', 12);
  const contractorUser = await prisma.user.upsert({
    where: { email: 'contractor@test.com' },
    update: {
      password: contractorPassword,
      name: 'Contractor User',
    },
    create: {
      email: 'contractor@test.com',
      password: contractorPassword,
      name: 'Contractor User',
    },
  });

  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: contractorUser.id,
        companyId: company.id,
      },
    },
    update: {
      role: 'Worker',
    },
    create: {
      userId: contractorUser.id,
      companyId: company.id,
      role: 'Worker',
    },
  });

  console.log('✅ Contractor user created');
  console.log('   Email: contractor@test.com');
  console.log('   Password: contractor123');
  console.log('   Role: Worker (Contractor)');

  // Create a sample project for the client
  console.log('\n📁 Creating sample project for client...');
  const project = await prisma.project.upsert({
    where: {
      id: 'sample-project-client',
    },
    update: {},
    create: {
      id: 'sample-project-client',
      companyId: company.id,
      customerId: customer.id,
      name: 'Residential Building Project',
      description: 'A sample project for the client to view progress',
      budget: 50000,
      status: 'InProgress',
      progress: 45,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  });

  // Create project phases
  await prisma.projectPhase.createMany({
    data: [
      {
        projectId: project.id,
        name: 'Planning',
        order: 1,
        status: 'Completed',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project.id,
        name: 'Foundation',
        order: 2,
        status: 'Completed',
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project.id,
        name: 'Framing',
        order: 3,
        status: 'InProgress',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project.id,
        name: 'Finishing',
        order: 4,
        status: 'Pending',
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Sample project created:', project.name);
  console.log('   Progress: 45%');
  console.log('   Status: InProgress');

  // Create a sample quote
  console.log('\n📄 Creating sample quote...');
  const quote = await prisma.quote.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      projectId: project.id,
      quoteNumber: `QT-${Date.now()}`,
      status: 'Sent',
      total: 50000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Sample quote created:', quote.quoteNumber);

  // Create a sample invoice
  console.log('\n💰 Creating sample invoice...');
  const invoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      projectId: project.id,
      invoiceNumber: `INV-${Date.now()}`,
      status: 'Sent',
      total: 25000,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Sample invoice created:', invoice.invoiceNumber);

  console.log('\n🎉 All users created successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('\n🔐 Admin User:');
  console.log('   Email: admin@test.com');
  console.log('   Password: admin123');
  console.log('   Role: Admin');
  console.log('   Access: Full system access + Admin dashboard');
  console.log('\n👥 Client User:');
  console.log('   Email: client@test.com');
  console.log('   Password: client123');
  console.log('   Role: Client');
  console.log('   Access: Client portal (/client) - View projects, quotes, invoices');
  console.log('\n🔧 Contractor User:');
  console.log('   Email: contractor@test.com');
  console.log('   Password: contractor123');
  console.log('   Role: Worker (Contractor)');
  console.log('   Access: View projects, jobs, time tracking');
  console.log('\n📁 Sample Data:');
  console.log('   - 1 Project (Residential Building Project)');
  console.log('   - 4 Project Phases');
  console.log('   - 1 Quote');
  console.log('   - 1 Invoice');
  console.log('\n💡 The client user can log in and see the sample project at /client');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

