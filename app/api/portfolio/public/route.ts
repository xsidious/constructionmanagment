import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Public portfolio - show all completed and in-progress projects from all companies
    // In production, you might want to filter by a specific company or make it configurable
    const projects = await prisma.project.findMany({
      where: {
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
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50, // Limit to 50 most recent projects
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching public portfolio projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio projects' },
      { status: 500 }
    );
  }
}

