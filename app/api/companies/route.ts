import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const createCompanySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  vat: z.string().optional(),
  currency: z.string().default('USD'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    
    const memberships = await prisma.companyMembership.findMany({
      where: { userId: session.userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            vat: true,
            currency: true,
            logo: true,
            createdAt: true,
          },
        },
      },
    });

    return apiSuccess(
      memberships.map((m) => ({
        ...m.company,
        role: m.role,
      }))
    );
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
    const body = await req.json();
    const { name, slug, vat, currency } = createCompanySchema.parse(body);

    // Check if slug exists
    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      return apiError('Company slug already exists', 400);
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        vat,
        currency,
        memberships: {
          create: {
            userId: session.userId,
            role: 'Owner',
          },
        },
      },
    });

    return apiSuccess(company, 201);
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

