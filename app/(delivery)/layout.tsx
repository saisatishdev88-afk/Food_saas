import React from 'react';
import Link from 'next/link';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-72 bg-[#eff1f2] dark:bg-slate-900 py-8 px-4 gap-2 shrink-0">
        <div className="px-6 mb-10">
          <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tighter">{user?.tenant?.name || 'Delivery'}</h1>
          <p className="font-sans text-xs uppercase tracking-wider text-on-surface-variant mt-1">Delivery Depot</p>
        </div>
        <nav className="flex flex-col gap-2 grow">
          <Link href="/delivery" className="flex items-center gap-4 bg-white dark:bg-slate-800 text-primary rounded-full px-6 py-4 shadow-sm active:scale-98 transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-sans text-sm uppercase tracking-wider font-bold">My Orders</span>
          </Link>
          <button className="flex items-center gap-4 text-on-surface px-6 py-4 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all active:scale-98">
            <span className="material-symbols-outlined">history</span>
            <span className="font-sans text-sm uppercase tracking-wider">History</span>
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant/10">
          <Link href="/login" className="flex items-center gap-4 text-error px-6 py-4 hover:bg-error-container/20 rounded-full transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-sans text-sm uppercase tracking-wider font-bold">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-8 h-20 shrink-0 bg-surface shadow-[0px_20px_40px_rgba(44,47,48,0.06)] z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-primary">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline font-extrabold text-2xl text-on-background tracking-tight">Active Deliveries</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex bg-surface-container-low px-4 py-2 rounded-full items-center gap-2">
              <span className="material-symbols-outlined text-primary scale-75">location_on</span>
              <span className="text-sm font-medium">On Duty: Sector 7A</span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
