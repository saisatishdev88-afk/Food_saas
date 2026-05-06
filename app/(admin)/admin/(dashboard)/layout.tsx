'use client';

import Link from 'next/link';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    router.replace('/admin/login');
  };

  return (
    <AdminGuard>
      <div className="flex min-h-[100dvh] overflow-hidden bg-background text-on-surface">
        {/* SideNavBar */}
        <aside className="hidden md:flex flex-col h-screen w-72 bg-[#eff1f2] dark:bg-slate-900 py-8 px-4 gap-2 fixed left-0 top-0 z-50">
          <div className="flex items-center gap-3 mb-10 px-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-primary text-xl leading-none">Foodsoul</h2>
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-on-surface-variant opacity-70">Admin Console</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1 flex-1">
            <Link href="/admin/dashboard" className="flex items-center gap-4 bg-white dark:bg-slate-800 text-primary rounded-full px-6 py-4 shadow-sm active:scale-98 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span className="font-sans text-sm uppercase tracking-wider font-semibold">Overview</span>
            </Link>
            <Link href="/admin/restaurants" className="flex items-center gap-4 text-on-surface px-6 py-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-98">
              <span className="material-symbols-outlined">storefront</span>
              <span className="font-sans text-sm uppercase tracking-wider font-semibold">Restaurants</span>
            </Link>
            <Link href="/pos" className="flex items-center gap-4 text-on-surface px-6 py-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-98">
              <span className="material-symbols-outlined">point_of_sale</span>
              <span className="font-sans text-sm uppercase tracking-wider">Live POS</span>
            </Link>
            <Link href="/kitchen" className="flex items-center gap-4 text-on-surface px-6 py-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-98">
              <span className="material-symbols-outlined">soup_kitchen</span>
              <span className="font-sans text-sm uppercase tracking-wider">Kitchen Display</span>
            </Link>
            <button className="flex items-center gap-4 text-on-surface px-6 py-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-98 text-left">
              <span className="material-symbols-outlined">analytics</span>
              <span className="font-sans text-sm uppercase tracking-wider">Analytics</span>
            </button>
            <Link href="/admin/staff" className="flex items-center gap-4 text-on-surface px-6 py-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-98">
              <span className="material-symbols-outlined">group</span>
              <span className="font-sans text-sm uppercase tracking-wider font-semibold">Staff Manager</span>
            </Link>
            <Link href="/admin/whatsapp" className="flex items-center gap-4 text-on-surface px-6 py-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-98">
              <span className="material-symbols-outlined text-green-500">chat</span>
              <span className="font-sans text-sm uppercase tracking-wider font-semibold">WhatsApp</span>
            </Link>
          </nav>
          
          <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 pt-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 text-on-surface px-6 py-3 hover:bg-red-50 hover:text-red-600 rounded-full transition-all w-full text-left"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-sans text-xs uppercase tracking-wider font-bold">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
          {/* TopNavBar */}
          <header className="flex justify-between items-center w-full px-8 h-20 bg-surface/90 backdrop-blur-md shadow-[0px_20px_40px_rgba(44,47,48,0.06)] sticky top-0 z-40">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-black text-primary tracking-tighter hidden lg:block font-headline">Foodsoul Network</span>
              <nav className="flex items-center gap-6">
                <Link href="/admin/dashboard" className="text-primary border-b-2 border-primary pb-1 font-headline font-bold tracking-tight active:scale-95 transition-transform">Dashboard</Link>
                <button className="text-on-surface-variant font-medium font-headline tracking-tight hover:text-primary transition-colors duration-200">Inventory</button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group hidden sm:block">
                <input className="bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-primary/20 text-sm text-on-surface placeholder:text-on-surface-variant outline-none" placeholder="Search orders..." type="text"/>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors relative">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border-2 border-surface-container-lowest shadow-sm">
                <img src="https://images.unsplash.com/photo-1583394838002-aec0805186b8?auto=format&fit=crop&w=150&q=80" alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          {children}
        </main>

        {/* Mobile NavBar */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest flex justify-around py-4 border-t border-outline-variant/10 z-50">
          <Link href="/admin/dashboard" className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">receipt</span>
            <span className="text-[10px] font-bold">Orders</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-error">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-[10px] font-bold">Exit</span>
          </button>
        </div>
      </div>
    </AdminGuard>
  );
}
