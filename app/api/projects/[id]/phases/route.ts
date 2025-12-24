import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const createPhaseSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().positive(),
  status: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:write');

    const body = await req.json();
    const data = createPhaseSchema.parse(body);

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

    const phase = await prisma.projectPhase.create({
      data: {
        ...data,
        projectId: params.id,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return apiSuccess(phase, 201);
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

