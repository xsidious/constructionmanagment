import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';
import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

const createPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
  paidAt: z.string().datetime().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'invoice:write');

    const body = await req.json();
    const { amount, method, reference, paidAt } = createPaymentSchema.parse(body);

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return apiError('Invoice not found', 404);
    }

    // Calculate total paid
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
    const newTotalPaid = totalPaid + amount;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: params.id,
        amount,
        method,
        reference,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    });

    // Update invoice status if fully paid
    if (newTotalPaid >= invoice.total.toNumber()) {
      await prisma.invoice.update({
        where: { id: params.id },
        data: {
          status: 'Paid',
          paidDate: new Date(),
        },
      });
    }

    return apiSuccess(payment, 201);
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

