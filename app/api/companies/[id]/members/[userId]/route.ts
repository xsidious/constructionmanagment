import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { Role } from '@prisma/client';

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await requireApiContext();
    await requireCompanyMembership(session, params.id);
    requireApiPermission(session, 'company:manage_members');

    const body = await req.json();
    const { role } = updateRoleSchema.parse(body);

    // Don't allow changing owner role
    const currentMembership = await prisma.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId: params.userId,
          companyId: params.id,
        },
      },
    });

    if (currentMembership?.role === 'Owner' && role !== 'Owner') {
      return apiError('Cannot change owner role', 400);
    }

    // Don't allow non-owners to change roles to/from Owner
    const requesterMembership = await prisma.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId: session.userId,
          companyId: params.id,
        },
      },
    });

    if (requesterMembership?.role !== 'Owner' && (role === 'Owner' || currentMembership?.role === 'Owner')) {
      return apiError('Only owners can manage owner role', 403);
    }

    const membership = await prisma.companyMembership.update({
      where: {
        userId_companyId: {
          userId: params.userId,
          companyId: params.id,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return apiSuccess(membership);
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

async function requireCompanyMembership(session: any, companyId: string) {
  const membership = await prisma.companyMembership.findUnique({
    where: {
      userId_companyId: {
        userId: session.userId,
        companyId,
      },
    },
  });

  if (!membership) {
    throw new Error('Unauthorized');
  }

  return membership;
}

