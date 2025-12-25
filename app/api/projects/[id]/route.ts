import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:read');

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        customer: true,
        phases: {
          orderBy: { order: 'asc' },
        },
        jobs: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            total: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
          },
        },
        materialUsages: {
          include: {
            material: true,
          },
        },
        chatRooms: {
          include: {
            messages: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            originalName: true,
            size: true,
            fileType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!project) {
      return apiError('Project not found', 404);
    }

    return apiSuccess(project);
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
    requireApiPermission(session, 'project:write');

    const body = await req.json();
    const data = updateProjectSchema.parse(body);

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!project) {
      return apiError('Project not found', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:delete');

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!project) {
      return apiError('Project not found', 404);
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: 'Project deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

