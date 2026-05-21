'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { TenantGuard } from '@/components/auth/TenantGuard';
import { RootState } from '@/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    dispatch(logout());
    success('Signed out from FoodSoul.');
    router.replace('/login');
  };

  const { data: dashboardData } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: async () => {
      const response = await api.get('/tenant/dashboard');
      return response.data;
    }
  });

  const modules = dashboardData?.modules || {
    qr_menu: false,
    inventory: false,
    shift_management: false,
    ai_assistant: false
  };

  const { data: shiftStatus } = useQuery({
    queryKey: ['shift-status'],
    queryFn: async () => {
      const response = await api.get('/tenant/shifts/status');
      return response.data;
    },
    enabled: !!modules.shift_management,
  });

  const toggleShiftMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tenant/shifts/toggle');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shift-status'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      success(data.message || (shiftStatus?.is_clocked_in ? 'Shift ended' : 'Shift started'));
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'Failed to toggle shift');
    }
  });

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Staff Manager', href: '/admin/staff', icon: 'group' },
    { name: 'Devices', href: '/admin/devices', icon: 'devices' },
    { name: 'Menu Editor', href: '/admin/menu', icon: 'restaurant_menu' },
    { name: 'Order History', href: '/admin/orders', icon: 'receipt_long' },
    { name: 'Point of Sale', href: '/pos', icon: 'point_of_sale' },
    { name: 'Kitchen KDS', href: '/kitchen', icon: 'soup_kitchen' },
    { name: 'Table Manager', href: '/admin/tables', icon: 'table_restaurant' },
  ];

  if (modules.qr_menu) navItems.push({ name: 'QR Ordering', href: '/admin/qr-menu', icon: 'qr_code_scanner' });
  if (modules.inventory) navItems.push({ name: 'Inventory', href: '/admin/inventory', icon: 'inventory_2' });
  if (modules.shift_management) navItems.push({ name: 'Shift Tracking', href: '/admin/shifts', icon: 'schedule' });
  if (modules.ai_assistant) navItems.push({ name: 'AI Assistant', href: '/admin/ai-assistant', icon: 'smart_toy' });
  if (modules.whatsapp_ordering) navItems.push({ name: 'WhatsApp', href: '/admin/whatsapp', icon: 'chat' });
  navItems.push({ name: 'Razorpay Settings', href: '/admin/razorpay', icon: 'account_balance' });
  navItems.push({ name: 'Subscription', href: '/admin/subscription', icon: 'payments' });
  navItems.push({ name: 'Help & Support', href: '/admin/tickets', icon: 'help_outline' });

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <TenantGuard>
      <div className="flex min-h-[100dvh] overflow-hidden bg-background text-on-surface">
        {/* SideNavBar */}
        <aside className="hidden md:flex flex-col h-screen w-72 bg-[#eff1f2] dark:bg-slate-900 py-8 px-4 gap-2 fixed left-0 top-0 z-50 border-r border-outline-variant/10">
          <div className="flex items-center gap-3 mb-10 px-6 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-[#2c2f30] text-xl leading-none italic">{user?.tenant?.name || 'Admin'}</h2>
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-on-surface-variant opacity-70">Outlet Console</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className={`flex items-center gap-4 px-6 py-4 rounded-full transition-all active:scale-98 ${
                    isActive 
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm font-bold' 
                    : 'text-on-surface-variant hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                  <span className="font-sans text-sm uppercase tracking-wider font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto shrink-0 flex flex-col gap-1 border-t border-outline-variant/10 pt-4">
            <div className="px-6 py-4 flex items-center gap-3 mb-2 bg-surface-container-high/30 rounded-2xl mx-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase">
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface truncate max-w-[120px] leading-tight">{user?.name}</p>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-tighter">Outlet Admin</p>
                </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 text-on-surface-variant px-6 py-3 hover:bg-error/5 hover:text-error rounded-full transition-all w-full text-left"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-sans text-xs uppercase tracking-wider font-bold">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
          {/* TopNavBar */}
          <header className="flex justify-between items-center w-full px-8 h-20 bg-surface/90 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-outline-variant/10">
            <div className="flex items-center gap-8">
              <span className="text-xl font-black text-primary tracking-tighter hidden lg:block font-headline uppercase italic">Restaurant Management</span>
            </div>
            <div className="flex items-center gap-6">
              {modules.shift_management && (
                <button 
                  onClick={() => toggleShiftMutation.mutate()}
                  disabled={toggleShiftMutation.isPending}
                  className={`h-10 px-6 rounded-full font-black uppercase tracking-widest text-[9px] shadow-sm transition-all border flex items-center gap-2 ${
                    shiftStatus?.is_clocked_in 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                    : 'bg-[#1a1c1d] text-white border-transparent hover:bg-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{shiftStatus?.is_clocked_in ? 'timer_off' : 'timer'}</span>
                  {shiftStatus?.is_clocked_in ? 'Clock Out' : 'Clock In'}
                </button>
              )}

              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors relative">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border-2 border-surface-container-lowest shadow-sm">
                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=ff7949&color=fff`} alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </TenantGuard>
  );
}
