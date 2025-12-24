import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext } from '@/lib/api-helpers';
import { hasPermission } from '@/lib/permissions';

export async function GET() {
  try {
    const context = await requireApiContext();
    
    // Check admin permission
    if (!hasPermission(context.role, 'admin:access')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get system-wide stats (admin can see all companies)
    const [totalUsers, totalCompanies, totalProjects, invoices] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.project.count(),
      prisma.invoice.findMany({
        select: { total: true },
      }),
    ]);

    const totalRevenue = invoices.reduce((sum, invoice) => {
      return sum + Number(invoice.total);
    }, 0);

    return NextResponse.json({
      totalUsers,
      totalCompanies,
      totalProjects,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}

