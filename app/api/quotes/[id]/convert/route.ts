import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { InvoiceStatus } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'invoice:write');

    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        lineItems: true,
      },
    });

    if (!quote) {
      return apiError('Quote not found', 404);
    }

    if (quote.status !== 'Approved') {
      return apiError('Only approved quotes can be converted to invoices', 400);
    }

    // Generate invoice number
    const count = await prisma.invoice.count({
      where: { companyId: session.companyId },
    });
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;

    // Create invoice from quote
    const invoice = await prisma.invoice.create({
      data: {
        companyId: session.companyId,
        customerId: quote.customerId,
        projectId: quote.projectId,
        quoteId: quote.id,
        invoiceNumber,
        status: InvoiceStatus.Sent,
        subtotal: quote.subtotal,
        tax: quote.tax,
        discount: quote.discount,
        total: quote.total,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        lineItems: {
          create: quote.lineItems.map((item) => ({
            type: item.type,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        customer: true,
        project: true,
        lineItems: true,
      },
    });

    return apiSuccess(invoice, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

