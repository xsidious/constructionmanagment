import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'chat:read');

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
      include: {
        messages: {
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
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          projectId: params.id,
          companyId: session.companyId,
          name: `Project: ${project.name}`,
        },
        include: {
          messages: {
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
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return apiSuccess(room);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

