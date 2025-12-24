import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const createMessageSchema = z.object({
  content: z.string().min(1),
  type: z.enum(['text', 'file', 'image']).default('text'),
  fileUrl: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'chat:write');

    const body = await req.json();
    const { content, type, fileUrl } = createMessageSchema.parse(body);

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

    // Get or create chat room
    let room = await prisma.chatRoom.findUnique({
      where: { projectId: params.id },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          projectId: params.id,
          companyId: session.companyId,
          name: `Project: ${project.name}`,
        },
      });
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        userId: session.userId,
        content,
        type,
        fileUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return apiSuccess(message, 201);
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

