import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'material:read');

    // Get all materials with minStockLevel set
    const materials = await prisma.material.findMany({
      where: {
        companyId: session.companyId,
        minStockLevel: { not: null },
      },
    });

    // Filter for low stock items
    const lowStock = materials.filter((material) => {
      if (!material.minStockLevel) return false;
      return material.stockQuantity.toNumber() <= material.minStockLevel.toNumber();
    });

    return apiSuccess(lowStock);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

