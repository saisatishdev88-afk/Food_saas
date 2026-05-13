'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';

interface ManagerGuardProps {
  children: React.ReactNode;
}

export const ManagerGuard: React.FC<ManagerGuardProps> = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Client-side only fallback
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

    if (!storedToken) {
      router.replace('/login');
      return;
    }

    if (storedRole && storedRole === 'superadmin') {
      router.replace('/admin'); // Send to their own portal
      return;
    }
    
    if (storedRole && storedRole !== 'admin') {
        router.replace('/login');
        return;
    }
  }, [router]);

  if (!isAuthenticated || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
