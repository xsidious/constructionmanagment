import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { PurchaseOrderStatus } from '@prisma/client';

const updatePurchaseOrderSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus).optional(),
  expectedDate: z.string().datetime().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'material:write');

    const body = await req.json();
    const data = updatePurchaseOrderSchema.parse(body);

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        items: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return apiError('Purchase order not found', 404);
    }

    const updateData: any = {};
    if (data.status !== undefined) {
      updateData.status = data.status;

      // If status is Received, update material stock
      if (data.status === 'Received') {
        for (const item of purchaseOrder.items) {
          await prisma.material.update({
            where: { id: item.materialId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }
    if (data.expectedDate !== undefined) {
      updateData.expectedDate = data.expectedDate ? new Date(data.expectedDate) : null;
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: updateData,
      include: {
        supplier: true,
        items: {
          include: {
            material: true,
          },
        },
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

