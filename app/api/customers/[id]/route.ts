import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'customer:read');

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
          },
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      return apiError('Customer not found', 404);
    }

    return apiSuccess(customer);
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
    requireApiPermission(session, 'customer:write');

    const body = await req.json();
    const data = updateCustomerSchema.parse(body);

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!customer) {
      return apiError('Customer not found', 404);
    }

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data,
    });

    return apiSuccess(updated);
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'customer:delete');

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
    });

    if (!customer) {
      return apiError('Customer not found', 404);
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: 'Customer deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

