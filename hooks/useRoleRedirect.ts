import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useRoleRedirect = () => {
  const router = useRouter();
  const { role, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && role) {
      switch (role) {
        case 'superadmin':
          router.push('/saas'); // SaaS Management
          break;
        case 'admin':
        case 'manager':
          router.push('/admin/dashboard'); // Restaurant Management
          break;
        case 'cashier':
        case 'waiter':
          router.push('/pos');
          break;
        case 'kitchen':
        case 'chef':
          router.push('/kitchen');
          break;
        case 'delivery':
          router.push('/delivery');
          break;
        default:
          router.push('/menu');
          break;
      }
    }
  }, [isAuthenticated, role, router]);
};
