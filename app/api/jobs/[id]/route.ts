import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { JobStatus, JobPriority } from '@prisma/client';

const updateJobSchema = z.object({
  assignedToId: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(JobPriority).optional(),
  dueDate: z.string().datetime().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'job:read');

    const where: any = {
      id: params.id,
      companyId: session.companyId,
    };

    // Workers can only see their own jobs
    if (session.role === 'Worker') {
      where.assignedToId = session.userId;
    }

    const job = await prisma.job.findFirst({
      where,
      include: {
        project: true,
        assignedTo: true,
      },
    });

    if (!job) {
      return apiError('Job not found', 404);
    }

    return apiSuccess(job);
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
    
    const where: any = {
      id: params.id,
      companyId: session.companyId,
    };

    // Workers can only update their own jobs
    if (session.role === 'Worker') {
      where.assignedToId = session.userId;
      requireApiPermission(session, 'job:write');
    } else {
      requireApiPermission(session, 'job:write');
    }

    const body = await req.json();
    const data = updateJobSchema.parse(body);

    const job = await prisma.job.findFirst({ where });

    if (!job) {
      return apiError('Job not found', 404);
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'Completed') {
        updateData.completedAt = new Date();
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedToId !== undefined) {
      // Verify user is member of company
      if (data.assignedToId) {
        const membership = await prisma.companyMembership.findUnique({
          where: {
            userId_companyId: {
              userId: data.assignedToId,
              companyId: session.companyId,
            },
          },
        });

        if (!membership) {
          return apiError('User is not a member of this company', 400);
        }
      }
      updateData.assignedToId = data.assignedToId;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: true,
        assignedTo: true,
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
    requireApiPermission(session, 'job:delete');

    const job = await prisma.job.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!job) {
      return apiError('Job not found', 404);
    }

    await prisma.job.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: 'Job deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

