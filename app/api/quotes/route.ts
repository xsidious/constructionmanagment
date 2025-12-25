import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const createQuoteSchema = z.object({
  customerName: z.string().optional(),
  customerId: z.string().optional(),
  clientAddress: z.string().optional(),
  projectId: z.string().optional(),
  status: z.nativeEnum(QuoteStatus).default(QuoteStatus.Draft),
  validUntil: z.string().optional(),
  lineItems: z.array(z.object({
    type: z.enum(['Labor', 'Material']),
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })),
  tax: z.number().default(0),
  discount: z.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'quote:read');

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    const where: any = {
      companyId: session.companyId,
    };

    if (customerId) where.customerId = customerId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(quotes);
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
    requireApiPermission(session, 'quote:write');

    const body = await req.json();
    const data = createQuoteSchema.parse(body);

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

    // Handle client address - create/find project if address provided
    let projectId = data.projectId;
    if (data.clientAddress && !projectId) {
      // Find or create a project with the address as name
      let project = await prisma.project.findFirst({
        where: {
          name: data.clientAddress,
          customerId: customer.id,
          companyId: session.companyId,
        },
      });
      
      if (!project) {
        project = await prisma.project.create({
          data: {
            name: data.clientAddress,
            customerId: customer.id,
            companyId: session.companyId,
            status: 'Planning',
          },
        });
      }
      projectId = project.id;
    } else if (projectId) {
      // Verify project if provided
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          companyId: session.companyId,
        },
      });

      if (!project) {
        return apiError('Project not found', 404);
      }
    }

    // Generate quote number
    const count = await prisma.quote.count({
      where: { companyId: session.companyId },
    });
    const quoteNumber = `QT-${String(count + 1).padStart(6, '0')}`;

    // Calculate totals
    const subtotal = data.lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const discountAmount = (subtotal * data.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * data.tax) / 100;
    const total = subtotal - discountAmount + taxAmount;

    const quote = await prisma.quote.create({
      data: {
        companyId: session.companyId,
        customerId: customer.id,
        projectId: projectId || null,
        quoteNumber,
        status: data.status,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        lineItems: {
          create: data.lineItems.map((item) => ({
            type: item.type as any,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        project: true,
        lineItems: true,
      },
    });

    return apiSuccess(quote, 201);
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

