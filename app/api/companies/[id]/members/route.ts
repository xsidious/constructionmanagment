import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { Role } from '@prisma/client';

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    await requireCompanyMembership(session, params.id);
    requireApiPermission(session, 'company:read');

    const members = await prisma.companyMembership.findMany({
      where: { companyId: params.id },
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

    return apiSuccess(
      members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: m.user,
        createdAt: m.createdAt,
      }))
    );
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
    await requireCompanyMembership(session, params.id);
    requireApiPermission(session, 'company:manage_members');

    const body = await req.json();
    const { email, role } = inviteUserSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // Check if already a member
    const existing = await prisma.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: params.id,
        },
      },
    });

    if (existing) {
      return apiError('User is already a member', 400);
    }

    // Create membership
    const membership = await prisma.companyMembership.create({
      data: {
        userId: user.id,
        companyId: params.id,
        role,
      },
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

    return apiSuccess(membership, 201);
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

