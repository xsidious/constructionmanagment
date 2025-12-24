import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { JobStatus, JobPriority } from '@prisma/client';

const createJobSchema = z.object({
  projectId: z.string(),
  assignedToId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(JobStatus).default(JobStatus.Pending),
  priority: z.nativeEnum(JobPriority).default(JobPriority.Medium),
  dueDate: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'job:read');

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const assignedToId = searchParams.get('assignedToId');
    const status = searchParams.get('status');

    const where: any = {
      companyId: session.companyId,
    };

    // Workers can only see their own jobs
    if (session.role === 'Worker') {
      where.assignedToId = session.userId;
    }

    if (projectId) where.projectId = projectId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(jobs);
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
    requireApiPermission(session, 'job:write');

    const body = await req.json();
    const data = createJobSchema.parse(body);

    // Verify project belongs to company
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        companyId: session.companyId,
      },
    });

    if (!project) {
      return apiError('Project not found', 404);
    }

    // Verify assigned user if provided
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

    const job = await prisma.job.create({
      data: {
        ...data,
        companyId: session.companyId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    return apiSuccess(job, 201);
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

