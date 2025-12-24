import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const createMaterialUsageSchema = z.object({
  materialId: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:write');

    const body = await req.json();
    const { materialId, quantity, unitPrice } = createMaterialUsageSchema.parse(body);

    // Verify project belongs to company
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!project) {
      return apiError('Project not found', 404);
    }

    // Verify material belongs to company
    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        companyId: session.companyId,
      },
    });

    if (!material) {
      return apiError('Material not found', 404);
    }

    // Check if enough stock
    if (material.stockQuantity.toNumber() < quantity) {
      return apiError('Insufficient stock', 400);
    }

    // Create usage record
    const usage = await prisma.materialUsage.create({
      data: {
        projectId: params.id,
        materialId,
        quantity,
        unitPrice,
      },
      include: {
        material: true,
      },
    });

    // Update material stock
    await prisma.material.update({
      where: { id: materialId },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });

    return apiSuccess(usage, 201);
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

