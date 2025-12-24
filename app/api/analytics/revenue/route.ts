import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess, requireApiPermission } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await requireApiContext();
    requireApiPermission(session, 'analytics:read');

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      companyId: session.companyId,
      status: 'Paid',
    };

    if (startDate) {
      where.paidDate = { ...where.paidDate, gte: new Date(startDate) };
    }
    if (endDate) {
      where.paidDate = { ...where.paidDate, lte: new Date(endDate) };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        payments: true,
      },
    });

    const totalRevenue = invoices.reduce((sum, invoice) => {
      const paid = invoice.payments.reduce((pSum, p) => pSum + p.amount.toNumber(), 0);
      return sum + paid;
    }, 0);

    // Monthly breakdown
    const monthlyRevenue: Record<string, number> = {};
    invoices.forEach((invoice) => {
      invoice.payments.forEach((payment) => {
        const month = payment.paidAt.toISOString().substring(0, 7);
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amount.toNumber();
      });
    });

    return apiSuccess({
      totalRevenue,
      monthlyRevenue,
      invoiceCount: invoices.length,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

