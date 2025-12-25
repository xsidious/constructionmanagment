import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
  type: z.enum(['note', 'change', 'update']).default('note'),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!project) {
      return apiError('Project not found', 404);
    }

    const notes = await prisma.projectNote.findMany({
      where: {
        projectId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiSuccess(notes);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:write');

    const body = await req.json();
    const { title, content, type } = createNoteSchema.parse(body);

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!project) {
      return apiError('Project not found', 404);
    }

    const note = await prisma.projectNote.create({
      data: {
        projectId: params.id,
        userId: session.userId,
        title,
        content,
        type,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return apiSuccess(note, 201);
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

