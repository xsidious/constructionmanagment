import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext } from '@/lib/api-helpers';
import { z } from 'zod';

const equipmentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['Vehicle', 'Tool', 'Machinery', 'Other']),
  status: z.enum(['Available', 'InUse', 'Maintenance', 'Retired']).optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  currentValue: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = { companyId: context.companyId };
    if (status) where.status = status;

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        _count: {
          select: {
            usages: true,
            maintenance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const body = await req.json();
    const data = equipmentSchema.parse(body);

    const equipment = await prisma.equipment.create({
      data: {
        companyId: context.companyId,
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice || null,
        currentValue: data.currentValue || null,
      },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}

