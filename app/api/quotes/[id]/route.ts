import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const updateQuoteSchema = z.object({
  status: z.nativeEnum(QuoteStatus).optional(),
  validUntil: z.string().optional(),
  lineItems: z.array(z.object({
    type: z.enum(['Labor', 'Material']),
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })).optional(),
  tax: z.number().optional(),
  discount: z.number().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'quote:read');

    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        customer: true,
        project: true,
        lineItems: true,
      },
    });

    if (!quote) {
      return apiError('Quote not found', 404);
    }

    return apiSuccess(quote);
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
    requireApiPermission(session, 'quote:write');

    const body = await req.json();
    const data = updateQuoteSchema.parse(body);

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

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.validUntil !== undefined) {
      updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
    }

    // Recalculate totals if line items changed
    if (data.lineItems) {
      // Delete existing line items
      await prisma.quoteLineItem.deleteMany({
        where: { quoteId: params.id },
      });

      // Create new line items
      const subtotal = data.lineItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      const discount = data.discount ?? quote.discount.toNumber();
      const tax = data.tax ?? quote.tax.toNumber();

      const discountAmount = (subtotal * discount) / 100;
      const taxAmount = ((subtotal - discountAmount) * tax) / 100;
      const total = subtotal - discountAmount + taxAmount;

      updateData.subtotal = subtotal;
      updateData.discount = discountAmount;
      updateData.tax = taxAmount;
      updateData.total = total;

      await prisma.quoteLineItem.createMany({
        data: data.lineItems.map((item) => ({
          quoteId: params.id,
          type: item.type as any,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      });
    } else if (data.discount !== undefined || data.tax !== undefined) {
      // Recalculate with existing line items
      const subtotal = quote.subtotal.toNumber();
      const discount = data.discount ?? quote.discount.toNumber();
      const tax = data.tax ?? quote.tax.toNumber();

      const discountAmount = (subtotal * discount) / 100;
      const taxAmount = ((subtotal - discountAmount) * tax) / 100;
      const total = subtotal - discountAmount + taxAmount;

      updateData.discount = discountAmount;
      updateData.tax = taxAmount;
      updateData.total = total;
    }

    const updated = await prisma.quote.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        project: true,
        lineItems: true,
      },
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

