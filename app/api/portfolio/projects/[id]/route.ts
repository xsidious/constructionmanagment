import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        companyId: session.companyId,
        status: {
          in: ['Completed', 'InProgress'],
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        phases: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching portfolio project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio project' },
      { status: 500 }
    );
  }
}

