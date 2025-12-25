import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['note', 'change', 'update']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:write');

    const body = await req.json();
    const data = updateNoteSchema.parse(body);

    const note = await prisma.projectNote.findFirst({
      where: {
        id: params.noteId,
        projectId: params.id,
        project: {
          companyId: session.companyId,
        },
      },
    });

    if (!note) {
      return apiError('Note not found', 404);
    }

    const updatedNote = await prisma.projectNote.update({
      where: {
        id: params.noteId,
      },
      data,
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

    return apiSuccess(updatedNote);
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
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:write');

    const note = await prisma.projectNote.findFirst({
      where: {
        id: params.noteId,
        projectId: params.id,
        project: {
          companyId: session.companyId,
        },
      },
    });

    if (!note) {
      return apiError('Note not found', 404);
    }

    await prisma.projectNote.delete({
      where: {
        id: params.noteId,
      },
    });

    return apiSuccess({ message: 'Note deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

