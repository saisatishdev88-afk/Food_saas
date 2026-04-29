'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

/**
 * Dispatcher Dashboard
 * This page serves as a traffic controller. When any user hits /dashboard,
 * they are redirected to their specific role-based interface.
 */
export default function DashboardDispatcher() {
  const router = useRouter();
  const { role, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    switch (role) {
      case 'superadmin':
        router.replace('/saas');
        break;
      case 'admin':
      case 'manager':
        router.replace('/admin/dashboard');
        break;
      case 'cashier':
      case 'waiter':
        router.replace('/pos');
        break;
      case 'kitchen':
      case 'chef':
        router.replace('/kitchen');
        break;
      case 'delivery':
        router.replace('/delivery');
        break;
      default:
        router.replace('/'); // Fallback to public home
        break;
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Authenticating Session...</p>
    </div>
  );
}
