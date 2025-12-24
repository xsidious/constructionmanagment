import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const createMaterialSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  unitPrice: z.number().positive(),
  stockQuantity: z.number().default(0),
  minStockLevel: z.number().positive().optional(),
  supplierId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'material:read');

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const supplierId = searchParams.get('supplierId');
    const lowStock = searchParams.get('lowStock') === 'true';

    const where: any = {
      companyId: session.companyId,
    };

    if (category) where.category = category;
    if (supplierId) where.supplierId = supplierId;
    // Note: Low stock filtering is handled separately in the alert endpoint

    const materials = await prisma.material.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return apiSuccess(materials);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'material:write');

    const body = await req.json();
    const data = createMaterialSchema.parse(body);

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

    const material = await prisma.material.create({
      data: {
        ...data,
        companyId: session.companyId,
        minStockLevel: data.minStockLevel || null,
      },
      include: {
        supplier: true,
      },
    });

    return apiSuccess(material, 201);
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

