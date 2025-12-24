import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { PurchaseOrderStatus } from '@prisma/client';

const createPurchaseOrderSchema = z.object({
  supplierId: z.string(),
  status: z.nativeEnum(PurchaseOrderStatus).default(PurchaseOrderStatus.Draft),
  expectedDate: z.string().datetime().optional(),
  items: z.array(z.object({
    materialId: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'material:read');

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const status = searchParams.get('status');

    const where: any = {
      companyId: session.companyId,
    };

    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    return apiSuccess(purchaseOrders);
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
    const data = createPurchaseOrderSchema.parse(body);

    // Verify supplier belongs to company
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: data.supplierId,
        companyId: session.companyId,
      },
    });

    if (!supplier) {
      return apiError('Supplier not found', 404);
    }

    // Verify materials belong to company
    for (const item of data.items) {
      const material = await prisma.material.findFirst({
        where: {
          id: item.materialId,
          companyId: session.companyId,
        },
      });

      if (!material) {
        return apiError(`Material ${item.materialId} not found`, 404);
      }
    }

    // Generate order number
    const count = await prisma.purchaseOrder.count({
      where: { companyId: session.companyId },
    });
    const orderNumber = `PO-${String(count + 1).padStart(6, '0')}`;

    // Calculate total
    const total = data.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        companyId: session.companyId,
        supplierId: data.supplierId,
        orderNumber,
        status: data.status,
        total,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        items: {
          create: data.items.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            material: true,
          },
        },
      },
    });

    return apiSuccess(purchaseOrder, 201);
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

