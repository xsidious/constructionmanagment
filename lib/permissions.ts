import { Role } from '@prisma/client';
import { prisma } from './prisma';

export type Permission = 
  | 'company:read'
  | 'company:write'
  | 'company:delete'
  | 'company:manage_members'
  | 'customer:read'
  | 'customer:write'
  | 'customer:delete'
  | 'project:read'
  | 'project:write'
  | 'project:delete'
  | 'quote:read'
  | 'quote:write'
  | 'quote:delete'
  | 'invoice:read'
  | 'invoice:write'
  | 'invoice:delete'
  | 'job:read'
  | 'job:write'
  | 'job:delete'
  | 'material:read'
  | 'material:write'
  | 'material:delete'
  | 'analytics:read'
  | 'chat:read'
  | 'chat:write';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Owner: [
    'company:read',
    'company:write',
    'company:delete',
    'company:manage_members',
    'customer:read',
    'customer:write',
    'customer:delete',
    'project:read',
    'project:write',
    'project:delete',
    'quote:read',
    'quote:write',
    'quote:delete',
    'invoice:read',
    'invoice:write',
    'invoice:delete',
    'job:read',
    'job:write',
    'job:delete',
    'material:read',
    'material:write',
    'material:delete',
    'analytics:read',
    'chat:read',
    'chat:write',
  ],
  Admin: [
    'company:read',
    'company:write',
    'company:manage_members',
    'customer:read',
    'customer:write',
    'customer:delete',
    'project:read',
    'project:write',
    'project:delete',
    'quote:read',
    'quote:write',
    'quote:delete',
    'invoice:read',
    'invoice:write',
    'invoice:delete',
    'job:read',
    'job:write',
    'job:delete',
    'material:read',
    'material:write',
    'material:delete',
    'analytics:read',
    'chat:read',
    'chat:write',
  ],
  Manager: [
    'company:read',
    'customer:read',
    'customer:write',
    'project:read',
    'project:write',
    'quote:read',
    'quote:write',
    'invoice:read',
    'invoice:write',
    'job:read',
    'job:write',
    'material:read',
    'material:write',
    'analytics:read',
    'chat:read',
    'chat:write',
  ],
  Worker: [
    'project:read',
    'job:read',
    'job:write',
    'chat:read',
    'chat:write',
  ],
  Accountant: [
    'company:read',
    'customer:read',
    'project:read',
    'quote:read',
    'quote:write',
    'invoice:read',
    'invoice:write',
    'analytics:read',
    'chat:read',
  ],
  Client: [
    'project:read',
    'quote:read',
    'invoice:read',
    'chat:read',
    'chat:write',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission} for role ${role}`);
  }
}

export async function checkCompanyMembership(
  userId: string,
  companyId: string
): Promise<{ role: Role; membership: { id: string; role: Role } } | null> {
  const membership = await prisma.companyMembership.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
  });

  if (!membership) {
    return null;
  }

  return {
    role: membership.role,
    membership: {
      id: membership.id,
      role: membership.role,
    },
  };
}

export async function requireCompanyMembership(
  userId: string,
  companyId: string
): Promise<Role> {
  const result = await checkCompanyMembership(userId, companyId);
  if (!result) {
    throw new Error('User is not a member of this company');
  }
  return result.role;
}

