import { auth } from '@/lib/auth';
import { requireCompanyMembership, requirePermission, hasPermission } from './permissions';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

export interface ApiContext {
  userId: string;
  companyId: string;
  role: Role;
}

export async function getApiContext(): Promise<ApiContext | null> {
  const session = await auth();
  
  if (!session?.user?.id || !session.companyId || !session.role) {
    return null;
  }

  // Verify membership
  try {
    const role = await requireCompanyMembership(session.user.id, session.companyId);
    return {
      userId: session.user.id,
      companyId: session.companyId,
      role,
    };
  } catch {
    return null;
  }
}

export async function requireApiContext(): Promise<ApiContext> {
  const context = await getApiContext();
  if (!context) {
    throw new Error('Unauthorized');
  }
  return context;
}

export function requireApiPermission(context: ApiContext, permission: string): void {
  requirePermission(context.role, permission as any);
}

export function hasApiPermission(context: ApiContext, permission: string): boolean {
  return hasPermission(context.role, permission as any);
}

export function apiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

