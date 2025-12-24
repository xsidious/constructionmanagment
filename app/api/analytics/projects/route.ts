import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'analytics:read');

    const projects = await prisma.project.findMany({
      where: {
        companyId: session.companyId,
      },
      include: {
        invoices: {
          include: {
            payments: true,
          },
        },
        materialUsages: {
          include: {
            material: true,
          },
        },
      },
    });

    const statusCounts: Record<string, number> = {};
    let totalBudget = 0;
    let totalRevenue = 0;
    let totalCosts = 0;

    projects.forEach((project) => {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
      
      if (project.budget) {
        totalBudget += project.budget.toNumber();
      }

      const projectRevenue = project.invoices.reduce((sum, inv) => {
        return sum + inv.payments.reduce((pSum, p) => pSum + p.amount.toNumber(), 0);
      }, 0);
      totalRevenue += projectRevenue;

      const projectCosts = project.materialUsages.reduce((sum, usage) => {
        return sum + (usage.quantity.toNumber() * usage.unitPrice.toNumber());
      }, 0);
      totalCosts += projectCosts;
    });

    return apiSuccess({
      totalProjects: projects.length,
      statusCounts,
      totalBudget,
      totalRevenue,
      totalCosts,
      profit: totalRevenue - totalCosts,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

