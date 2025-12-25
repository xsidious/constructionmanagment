import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext } from '@/lib/api-helpers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
  hours: z.number().positive().optional(),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireApiContext();
    const entry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        companyId: context.companyId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        job: { select: { id: true, title: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching time entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entry' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireApiContext();
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updateData: any = { ...data };
    if (data.status === 'Approved') {
      updateData.approvedById = context.userId;
      updateData.approvedAt = new Date();
    }

    const entry = await prisma.timeEntry.update({
      where: {
        id: params.id,
        companyId: context.companyId,
      },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        job: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to update time entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireApiContext();
    await prisma.timeEntry.delete({
      where: {
        id: params.id,
        companyId: context.companyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
}

