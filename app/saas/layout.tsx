'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { RootState } from '@/store';

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    router.replace('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/saas', icon: 'dashboard' },
    { name: 'Restaurants', href: '/saas/restaurants', icon: 'storefront' },
    { name: 'Subscriptions', href: '/saas/subscriptions', icon: 'payments' },
    { name: 'Support Tickets', href: '/saas/tickets', icon: 'confirmation_number' },
    { name: 'Devices', href: '/saas/devices', icon: 'devices' },
  ];

  return (
    <AdminGuard>
      <div className="bg-background text-on-surface flex min-h-screen">
        {/* SideNavBar Component */}
        <aside className="hidden md:flex flex-col h-[100dvh] w-72 bg-[#eff1f2] dark:bg-slate-950 py-8 px-4 gap-2 shrink-0 fixed left-0 top-0 overflow-y-auto z-50 border-r border-outline-variant/10">
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
            </div>
            <div>
              <h1 className="font-headline font-black text-primary text-xl uppercase italic tracking-tighter">Foodsoul</h1>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Saas Console</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className={`flex items-center gap-4 px-6 py-4 rounded-full transition-all active:scale-98 ${
                    isActive 
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm font-bold' 
                    : 'text-on-surface-variant hover:bg-white/50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                  <span className="font-sans text-sm uppercase tracking-wider font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 pt-4">
             <div className="px-6 py-4 flex items-center gap-3 mb-2 bg-surface-container-high/30 rounded-2xl mx-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase">
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface truncate max-w-[120px] leading-tight">{user?.name}</p>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-tighter">Network Root</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-4 text-on-surface-variant px-6 py-4 hover:bg-error/5 hover:text-error rounded-full transition-all text-left font-bold text-xs uppercase tracking-widest"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-sans">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen md:ml-72">
          {/* TopNavBar */}
          <header className="flex justify-between items-center w-full px-8 h-20 bg-surface/90 backdrop-blur-sm shadow-sm z-10 sticky top-0 border-b border-outline-variant/10">
            <div className="flex items-center gap-8">
              <span className="text-xl font-black text-primary tracking-tighter hidden lg:block uppercase italic">Platform Administration</span>
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input className="pl-10 pr-4 py-2 bg-slate-200/50 border-none rounded-full w-64 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium" placeholder="Search objects..." type="text"/>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200/50 transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="ml-2 ring-2 ring-primary/10 rounded-full p-0.5">
                  <img alt="User profile" className="w-10 h-10 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name}&background=333&color=fff`}/>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
