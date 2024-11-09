import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

type PermissionGuardProps = {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
};

export function PermissionGuard({ children, permission, fallback }: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</> || null;
  }

  return <>{children}</>;
}