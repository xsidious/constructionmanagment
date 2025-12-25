import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext, apiError, apiSuccess } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireApiContext();

    const subcontractor = await prisma.subcontractor.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
      },
      include: {
        workOrders: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        files: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            workOrders: true,
            files: true,
          },
        },
      },
    });

    if (!subcontractor) {
      return apiError('Subcontractor not found', 404);
    }

    // Calculate totals
    const totalCost = subcontractor.workOrders.reduce((sum, work) => {
      return sum + Number(work.amount);
    }, 0);

    const paidCost = subcontractor.workOrders
      .filter((work) => work.paidDate)
      .reduce((sum, work) => {
        return sum + Number(work.amount);
      }, 0);

    const upcomingJobs = subcontractor.workOrders.filter(
      (work) => work.status === 'Pending' || work.status === 'InProgress'
    );

    const pastJobs = subcontractor.workOrders.filter(
      (work) => work.status === 'Completed' || work.paidDate
    );

    return apiSuccess({
      ...subcontractor,
      totalCost,
      paidCost,
      upcomingJobs,
      pastJobs,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return apiError('Unauthorized', 401);
    }
    return apiError('Internal server error', 500);
  }
}

