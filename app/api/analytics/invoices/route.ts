import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'analytics:read');

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId: session.companyId,
      },
      include: {
        payments: true,
      },
    });

    const statusCounts: Record<string, number> = {};
    let totalAmount = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    invoices.forEach((invoice) => {
      statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1;
      totalAmount += invoice.total.toNumber();

      const paid = invoice.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
      totalPaid += paid;
      totalUnpaid += invoice.total.toNumber() - paid;
    });

    return apiSuccess({
      totalInvoices: invoices.length,
      statusCounts,
      totalAmount,
      totalPaid,
      totalUnpaid,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

