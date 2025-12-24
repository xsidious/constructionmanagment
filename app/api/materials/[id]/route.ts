import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const updateMaterialSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  unitPrice: z.number().positive().optional(),
  stockQuantity: z.number().optional(),
  minStockLevel: z.number().positive().optional(),
  supplierId: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'material:read');

    const material = await prisma.material.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        supplier: true,
        usages: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { usedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!material) {
      return apiError('Material not found', 404);
    }

    return apiSuccess(material);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'material:write');

    const body = await req.json();
    const data = updateMaterialSchema.parse(body);

    const material = await prisma.material.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!material) {
      return apiError('Material not found', 404);
    }

    // Verify supplier if provided
    if (data.supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: data.supplierId,
          companyId: session.companyId,
        },
      });

      if (!supplier) {
        return apiError('Supplier not found', 404);
      }
    }

    const updated = await prisma.material.update({
      where: { id: params.id },
      data: {
        ...data,
        minStockLevel: data.minStockLevel !== undefined ? data.minStockLevel : material.minStockLevel,
      },
      include: {
        supplier: true,
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError('Invalid input', 400);
    }
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

