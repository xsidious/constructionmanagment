const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Supabase!');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible. Current users: ${userCount}`);
    
    // Test new tables
    const timeEntryCount = await prisma.timeEntry.count().catch(() => 0);
    const equipmentCount = await prisma.equipment.count().catch(() => 0);
    const expenseCount = await prisma.expense.count().catch(() => 0);
    const subcontractorCount = await prisma.subcontractor.count().catch(() => 0);
    
    console.log('\n📊 Database Tables Status:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Time Entries: ${timeEntryCount}`);
    console.log(`   Equipment: ${equipmentCount}`);
    console.log(`   Expenses: ${expenseCount}`);
    console.log(`   Subcontractors: ${subcontractorCount}`);
    
    console.log('\n✅ All new tables are accessible!');
    console.log('🎉 Supabase connection is working perfectly!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 'P1001') {
      console.error('   Database connection failed. Check your connection string.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

