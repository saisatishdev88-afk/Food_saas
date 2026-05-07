'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';

interface TenantGuardProps {
  children: React.ReactNode;
}

export const TenantGuard: React.FC<TenantGuardProps> = ({ children }) => {
  const { isAuthenticated, role, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Allow all tenant-scoped roles
    const tenantRoles = ['admin', 'manager', 'cashier', 'waiter', 'kitchen', 'chef', 'delivery'];
    const isTenantUser = tenantRoles.includes(role || '');
    if (!isAuthenticated || !isTenantUser || !user?.tenant_id) {
      router.replace('/login');
    }
  }, [isAuthenticated, role, user, router]);

  const tenantRoles = ['admin', 'manager', 'cashier', 'waiter', 'kitchen', 'chef', 'delivery'];
  const isTenantUser = tenantRoles.includes(role || '');
  if (!isAuthenticated || !isTenantUser || !user?.tenant_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
