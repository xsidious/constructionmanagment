import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's email to find associated customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find customer by email
    const customer = await prisma.customer.findFirst({
      where: { email: user.email },
    });

    if (!customer) {
      return NextResponse.json([]);
    }

    // Get all projects for this customer
    const projects = await prisma.project.findMany({
      where: {
        customerId: customer.id,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        phases: {
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            name: true,
            status: true,
            order: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching client projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

