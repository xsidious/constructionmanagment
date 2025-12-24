import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'analytics:read');

    const materials = await prisma.material.findMany({
      where: {
        companyId: session.companyId,
      },
      include: {
        usages: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    let totalMaterialCost = 0;
    const materialCosts: Array<{ materialId: string; name: string; cost: number }> = [];

    materials.forEach((material) => {
      const cost = material.usages.reduce((sum, usage) => {
        return sum + (usage.quantity.toNumber() * usage.unitPrice.toNumber());
      }, 0);

      totalMaterialCost += cost;
      materialCosts.push({
        materialId: material.id,
        name: material.name,
        cost,
      });
    });

    // Get labor costs from invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId: session.companyId,
      },
      include: {
        lineItems: true,
      },
    });

    let totalLaborCost = 0;
    invoices.forEach((invoice) => {
      invoice.lineItems.forEach((item) => {
        if (item.type === 'Labor') {
          totalLaborCost += item.total.toNumber();
        }
      });
    });

    return apiSuccess({
      totalMaterialCost,
      totalLaborCost,
      totalCost: totalMaterialCost + totalLaborCost,
      materialCosts: materialCosts.sort((a, b) => b.cost - a.cost).slice(0, 10), // Top 10
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

