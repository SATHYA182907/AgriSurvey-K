import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { mockDb } from '@/services/mock-db';
import { UserRole } from '@/types';
import { canAccessRoleRoute } from '@/lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const currentUser = mockDb.currentUser;

  // Unauthenticated user attempting to enter protected portal
  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Role authorization check
  if (allowedRoles && !canAccessRoleRoute(currentUser.role, allowedRoles)) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
