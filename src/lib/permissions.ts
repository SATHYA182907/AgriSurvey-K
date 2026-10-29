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

export function canAccessRoute(role: UserRole | undefined, path: string): boolean {
  if (!role) return false;
  if (role === 'admin') return true;
  if (path.startsWith('/gis/')) return true;
  if (path.startsWith('/tahsildar') && role !== 'tahsildar') return false;
  if (path.startsWith('/field-worker') && role !== 'field_worker') return false;
  if (path.startsWith('/admin')) return false;
  return true;
}
