import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const updateInvoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus).optional(),
  dueDate: z.string().optional(),
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
    requireApiPermission(session, 'invoice:read');

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        customer: true,
        project: true,
        quote: true,
        lineItems: true,
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      return apiError('Invoice not found', 404);
    }

    // Convert Decimal fields to numbers for JSON serialization
    const invoiceData = {
      ...invoice,
      subtotal: typeof invoice.subtotal === 'object' && invoice.subtotal?.toNumber ? invoice.subtotal.toNumber() : Number(invoice.subtotal),
      tax: typeof invoice.tax === 'object' && invoice.tax?.toNumber ? invoice.tax.toNumber() : Number(invoice.tax),
      discount: typeof invoice.discount === 'object' && invoice.discount?.toNumber ? invoice.discount.toNumber() : Number(invoice.discount),
      total: typeof invoice.total === 'object' && invoice.total?.toNumber ? invoice.total.toNumber() : Number(invoice.total),
      lineItems: invoice.lineItems.map(item => ({
        ...item,
        unitPrice: typeof item.unitPrice === 'object' && item.unitPrice?.toNumber ? item.unitPrice.toNumber() : Number(item.unitPrice),
        total: typeof item.total === 'object' && item.total?.toNumber ? item.total.toNumber() : Number(item.total),
      })),
      payments: invoice.payments.map(payment => ({
        ...payment,
        amount: typeof payment.amount === 'object' && payment.amount?.toNumber ? payment.amount.toNumber() : Number(payment.amount),
      })),
    };

    return apiSuccess(invoiceData);
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
    requireApiPermission(session, 'invoice:write');

    const body = await req.json();
    const data = updateInvoiceSchema.parse(body);

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      return apiError('Invoice not found', 404);
    }

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    // Recalculate totals if line items changed
    if (data.lineItems) {
      // Delete existing line items
      await prisma.invoiceLineItem.deleteMany({
        where: { invoiceId: params.id },
      });

      // Create new line items
      const subtotal = data.lineItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      const discount = data.discount ?? invoice.discount.toNumber();
      const tax = data.tax ?? invoice.tax.toNumber();

      const discountAmount = (subtotal * discount) / 100;
      const taxAmount = ((subtotal - discountAmount) * tax) / 100;
      const total = subtotal - discountAmount + taxAmount;

      updateData.subtotal = subtotal;
      updateData.discount = discountAmount;
      updateData.tax = taxAmount;
      updateData.total = total;

      await prisma.invoiceLineItem.createMany({
        data: data.lineItems.map((item) => ({
          invoiceId: params.id,
          type: item.type as any,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      });
    } else if (data.discount !== undefined || data.tax !== undefined) {
      // Recalculate with existing line items
      const subtotal = invoice.subtotal.toNumber();
      const discount = data.discount ?? invoice.discount.toNumber();
      const tax = data.tax ?? invoice.tax.toNumber();

      const discountAmount = (subtotal * discount) / 100;
      const taxAmount = ((subtotal - discountAmount) * tax) / 100;
      const total = subtotal - discountAmount + taxAmount;

      updateData.discount = discountAmount;
      updateData.tax = taxAmount;
      updateData.total = total;
    }

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        project: true,
        lineItems: true,
        payments: true,
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const invoiceData = {
      ...updated,
      subtotal: typeof updated.subtotal === 'object' && updated.subtotal?.toNumber ? updated.subtotal.toNumber() : Number(updated.subtotal),
      tax: typeof updated.tax === 'object' && updated.tax?.toNumber ? updated.tax.toNumber() : Number(updated.tax),
      discount: typeof updated.discount === 'object' && updated.discount?.toNumber ? updated.discount.toNumber() : Number(updated.discount),
      total: typeof updated.total === 'object' && updated.total?.toNumber ? updated.total.toNumber() : Number(updated.total),
      lineItems: updated.lineItems.map(item => ({
        ...item,
        unitPrice: typeof item.unitPrice === 'object' && item.unitPrice?.toNumber ? item.unitPrice.toNumber() : Number(item.unitPrice),
        total: typeof item.total === 'object' && item.total?.toNumber ? item.total.toNumber() : Number(item.total),
      })),
      payments: updated.payments.map(payment => ({
        ...payment,
        amount: typeof payment.amount === 'object' && payment.amount?.toNumber ? payment.amount.toNumber() : Number(payment.amount),
      })),
    };

    return apiSuccess(invoiceData);
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

