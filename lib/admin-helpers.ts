import { Role } from '@prisma/client';
import { hasPermission } from './permissions';

export function isAdmin(role: Role | undefined): boolean {
  if (!role) return false;
  return hasPermission(role, 'admin:access');
}

export function requireAdmin(role: Role | undefined): void {
  if (!isAdmin(role)) {
    throw new Error('Admin access required');
  }
}

