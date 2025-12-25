import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const createProjectSchema = z.object({
  customerName: z.string().optional(),
  customerId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.Planning),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'project:read');

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const where: any = {
      companyId: session.companyId,
    };

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(projects);
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
    requireApiPermission(session, 'project:write');

    const body = await req.json();
    const data = createProjectSchema.parse(body);

    // Find or create customer
    let customer;
    if (data.customerId) {
      customer = await prisma.customer.findFirst({
        where: {
          id: data.customerId,
          companyId: session.companyId,
        },
      });
      if (!customer) {
        return apiError('Customer not found', 404);
      }
    } else if (data.customerName) {
      // Find or create customer by name
      customer = await prisma.customer.findFirst({
        where: {
          name: data.customerName,
          companyId: session.companyId,
        },
      });
      
      if (!customer) {
        // Create new customer
        customer = await prisma.customer.create({
          data: {
            name: data.customerName,
            companyId: session.companyId,
          },
        });
      }
    } else {
      return apiError('Customer name or ID is required', 400);
    }

    const project = await prisma.project.create({
      data: {
        customerId: customer.id,
        name: data.name,
        description: data.description || null,
        budget: data.budget ? data.budget : null,
        status: data.status,
        companyId: session.companyId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return apiSuccess(project, 201);
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

