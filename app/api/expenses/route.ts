import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiContext } from '@/lib/api-helpers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const expenseSchema = z.object({
  projectId: z.string().optional(),
  category: z.enum(['Materials', 'Labor', 'Equipment', 'Subcontractor', 'Travel', 'Utilities', 'Insurance', 'Other']),
  amount: z.number().positive(),
  description: z.string().min(1),
  receiptUrl: z.string().optional(),
  date: z.string(),
  vendor: z.string().optional(),
  paidBy: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { companyId: context.companyId };
    if (projectId) where.projectId = projectId;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const expensesData = expenses.map(expense => ({
      ...expense,
      amount: typeof expense.amount === 'object' && expense.amount?.toNumber ? expense.amount.toNumber() : Number(expense.amount),
    }));

    return NextResponse.json(expensesData);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireApiContext();
    const body = await req.json();
    const data = expenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        companyId: context.companyId,
        ...data,
        date: new Date(data.date),
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const expenseData = {
      ...expense,
      amount: typeof expense.amount === 'object' && expense.amount?.toNumber ? expense.amount.toNumber() : Number(expense.amount),
    };

    return NextResponse.json(expenseData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

