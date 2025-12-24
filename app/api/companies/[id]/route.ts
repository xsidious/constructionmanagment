import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  vat: z.string().optional(),
  currency: z.string().optional(),
  logo: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    await requireCompanyMembership(session, params.id);

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        slug: true,
        vat: true,
        currency: true,
        logo: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      return apiError('Company not found', 404);
    }

    return apiSuccess(company);
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
    await requireCompanyMembership(session, params.id);
    requireApiPermission(session, 'company:write');

    const body = await req.json();
    const data = updateCompanySchema.parse(body);

    const company = await prisma.company.update({
      where: { id: params.id },
      data,
    });

    return apiSuccess(company);
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

