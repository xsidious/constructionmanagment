const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create a company
  const company = await prisma.company.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Construction Company',
      slug: 'demo-company',
      currency: 'USD',
    },
  });

  console.log('✅ Created company:', company.name);

  // Create company membership
  await prisma.companyMembership.upsert({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      companyId: company.id,
      role: 'Owner',
    },
  });

  console.log('✅ Created company membership');

  // Create a customer
  const customer = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0100',
      address: '123 Main St, City, State 12345',
    },
  });

  console.log('✅ Created customer:', customer.name);

  // Create a project
  const project = await prisma.project.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      name: 'Residential Building Project',
      description: 'Construction of a new residential building',
      budget: 500000,
      status: 'InProgress',
      progress: 25,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    },
  });

  console.log('✅ Created project:', project.name);

  // Create project phases
  const phases = [
    { name: 'Foundation', order: 1 },
    { name: 'Framing', order: 2 },
    { name: 'Electrical & Plumbing', order: 3 },
    { name: 'Finishing', order: 4 },
  ];

  for (const phase of phases) {
    await prisma.projectPhase.create({
      data: {
        projectId: project.id,
        ...phase,
        status: phase.order === 1 ? 'InProgress' : 'Pending',
      },
    });
  }

  console.log('✅ Created project phases');

  // Create a job
  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      projectId: project.id,
      assignedToId: user.id,
      title: 'Install Foundation',
      description: 'Prepare and pour foundation',
      status: 'InProgress',
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  console.log('✅ Created job:', job.title);

  // Create a supplier
  const supplier = await prisma.supplier.create({
    data: {
      companyId: company.id,
      name: 'ABC Materials Supply',
      email: 'contact@abcmaterials.com',
      phone: '+1-555-0200',
      address: '456 Supply St, City, State 12345',
    },
  });

  console.log('✅ Created supplier:', supplier.name);

  // Create materials
  const materials = [
    { name: 'Concrete Mix', sku: 'CONC-001', category: 'Concrete', unit: 'cubic yard', unitPrice: 150, stockQuantity: 100, minStockLevel: 20 },
    { name: 'Steel Rebar', sku: 'STL-001', category: 'Steel', unit: 'ton', unitPrice: 800, stockQuantity: 50, minStockLevel: 10 },
    { name: 'Lumber 2x4', sku: 'LUM-001', category: 'Lumber', unit: 'board foot', unitPrice: 2.5, stockQuantity: 1000, minStockLevel: 200 },
  ];

  for (const material of materials) {
    await prisma.material.create({
      data: {
        companyId: company.id,
        supplierId: supplier.id,
        ...material,
      },
    });
  }

  console.log('✅ Created materials');

  // Create a quote
  const quote = await prisma.quote.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      projectId: project.id,
      quoteNumber: `QT-${Date.now()}`,
      status: 'Sent',
      subtotal: 450000,
      tax: 36000,
      total: 486000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      lineItems: {
        create: [
          {
            type: 'Labor',
            description: 'Construction labor',
            quantity: 1000,
            unitPrice: 50,
            total: 50000,
          },
          {
            type: 'Material',
            description: 'Building materials',
            quantity: 1,
            unitPrice: 400000,
            total: 400000,
          },
        ],
      },
    },
  });

  console.log('✅ Created quote:', quote.quoteNumber);

  // Create an invoice
  const invoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      customerId: customer.id,
      projectId: project.id,
      quoteId: quote.id,
      invoiceNumber: `INV-${Date.now()}`,
      status: 'Sent',
      subtotal: 450000,
      tax: 36000,
      total: 486000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems: {
        create: [
          {
            type: 'Labor',
            description: 'Construction labor',
            quantity: 1000,
            unitPrice: 50,
            total: 50000,
          },
          {
            type: 'Material',
            description: 'Building materials',
            quantity: 1,
            unitPrice: 400000,
            total: 400000,
          },
        ],
      },
    },
  });

  console.log('✅ Created invoice:', invoice.invoiceNumber);

  // Create a time entry
  await prisma.timeEntry.create({
    data: {
      companyId: company.id,
      userId: user.id,
      projectId: project.id,
      jobId: job.id,
      date: new Date(),
      hours: 8,
      description: 'Foundation work',
      hourlyRate: 50,
      totalAmount: 400,
      status: 'Approved',
      approvedById: user.id,
      approvedAt: new Date(),
    },
  });

  console.log('✅ Created time entry');

  // Create equipment
  await prisma.equipment.create({
    data: {
      companyId: company.id,
      name: 'Excavator CAT 320',
      type: 'Machinery',
      status: 'InUse',
      serialNumber: 'EXC-001',
      model: 'CAT 320',
      manufacturer: 'Caterpillar',
      purchaseDate: new Date('2023-01-15'),
      purchasePrice: 250000,
      currentValue: 200000,
      location: 'Site A',
    },
  });

  console.log('✅ Created equipment');

  // Create expense
  await prisma.expense.create({
    data: {
      companyId: company.id,
      projectId: project.id,
      category: 'Materials',
      amount: 5000,
      description: 'Concrete delivery',
      date: new Date(),
      vendor: 'ABC Materials Supply',
    },
  });

  console.log('✅ Created expense');

  // Create subcontractor
  const subcontractor = await prisma.subcontractor.create({
    data: {
      companyId: company.id,
      name: 'XYZ Electrical Services',
      email: 'contact@xyzelectrical.com',
      phone: '+1-555-0300',
      specialty: 'Electrical Installation',
      hourlyRate: 75,
    },
  });

  console.log('✅ Created subcontractor');

  // Create subcontractor work
  await prisma.subcontractorWork.create({
    data: {
      subcontractorId: subcontractor.id,
      projectId: project.id,
      description: 'Electrical wiring installation',
      amount: 15000,
      status: 'Pending',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created subcontractor work');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Email: admin@test.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

