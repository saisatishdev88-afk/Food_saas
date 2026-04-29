'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // If not authenticated or not a superadmin, redirect to login
    if (!isAuthenticated || role !== 'superadmin') {
      router.replace('/login');
    }
  }, [isAuthenticated, role, router]);

  // Optionally show a loading state or nothing while redirecting
  if (!isAuthenticated || role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a63300]"></div>
      </div>
    );
  }

  return <>{children}</>;
};
