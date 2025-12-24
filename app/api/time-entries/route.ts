import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext } from '@/lib/api-helpers';
import { z } from 'zod';

const timeEntrySchema = z.object({
  projectId: z.string().optional(),
  jobId: z.string().optional(),
  date: z.string(),
  hours: z.number().positive(),
  description: z.string().optional(),
  hourlyRate: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { companyId: context.companyId };
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const body = await req.json();
    const data = timeEntrySchema.parse(body);

    const entry = await prisma.timeEntry.create({
      data: {
        companyId: context.companyId,
        userId: context.userId,
        projectId: data.projectId,
        jobId: data.jobId,
        date: new Date(data.date),
        hours: data.hours,
        description: data.description,
        hourlyRate: data.hourlyRate,
        totalAmount: data.hourlyRate ? data.hours * data.hourlyRate : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        job: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}

