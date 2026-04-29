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
    // If not authenticated, not an owner (admin/manager), or has no tenant_id, redirect
    const isTenantUser = role === 'admin' || role === 'manager';
    if (!isAuthenticated || !isTenantUser || !user?.tenant_id) {
      router.replace('/login');
    }
  }, [isAuthenticated, role, user, router]);

  const isTenantUser = role === 'admin' || role === 'manager';
  if (!isAuthenticated || !isTenantUser || !user?.tenant_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
