import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext } from '@/lib/api-helpers';
import { z } from 'zod';

const subcontractorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  specialty: z.string().optional(),
  hourlyRate: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const subcontractors = await prisma.subcontractor.findMany({
      where: { companyId: context.companyId },
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subcontractors);
  } catch (error) {
    console.error('Error fetching subcontractors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcontractors' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const body = await req.json();
    const data = subcontractorSchema.parse(body);

    const subcontractor = await prisma.subcontractor.create({
      data: {
        companyId: context.companyId,
        ...data,
        hourlyRate: data.hourlyRate || null,
      },
    });

    return NextResponse.json(subcontractor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating subcontractor:', error);
    return NextResponse.json(
      { error: 'Failed to create subcontractor' },
      { status: 500 }
    );
  }
}

