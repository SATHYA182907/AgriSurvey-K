import { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  farmer: 'Farmer / Landholder',
  tahsildar: 'Tahsildar / Revenue Officer',
  field_worker: 'Field Verification Worker',
  admin: 'System Administrator',
};

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  farmer: '/farmer/dashboard',
  tahsildar: '/tahsildar/dashboard',
  field_worker: '/field-worker/dashboard',
  admin: '/admin/dashboard',
};

export function canAccessRoleRoute(userRole: UserRole | undefined, requiredRole: UserRole | UserRole[]): boolean {
  if (!userRole) return false;
  if (userRole === 'admin') return true; // Admin has oversight access
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}
