'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '@/store/slices/authSlice';

export default function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const isSaas = window.location.pathname.startsWith('/saas') || window.location.pathname.startsWith('/admin/login');
    const prefix = isSaas ? 'saas_' : 'tenant_';
    
    const token = localStorage.getItem(`${prefix}token`);
    const role = localStorage.getItem(`${prefix}role`);
    const userStr = localStorage.getItem(`${prefix}user`);
    const loginTime = localStorage.getItem(`${prefix}loginTime`);
    
    // 8 hours in milliseconds
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;

    if (token && role && userStr && loginTime) {
      const now = Date.now();
      const timeSinceLogin = now - parseInt(loginTime, 10);

      if (timeSinceLogin > EIGHT_HOURS) {
        // Session expired
        dispatch(logout());
      } else {
        // Hydrate session
        try {
          const user = JSON.parse(userStr);
          dispatch(setCredentials({ user, role, token }));
        } catch (e) {
          dispatch(logout());
        }
      }
    } else {
      // Missing some credentials, ensure clean state
      dispatch(logout());
    }
    setHydrated(true);
  }, [dispatch]);

  // Prevent hydration mismatch and flash of unprotected content
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
