import Link from 'next/link';
import React from 'react';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="bg-[#f5f6f7] dark:bg-slate-900 shadow-[0px_20px_40px_rgba(44,47,48,0.06)] h-20 flex justify-between items-center w-full px-8 fixed top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black text-[#a63300] dark:text-[#FF6B35] tracking-tighter">Kitchen Node</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low rounded-full transition-colors text-sm font-bold text-error">
            <span className="material-symbols-outlined text-base">logout</span> Sign Out
          </Link>
        </div>
      </header>

      <main className="pt-28 px-8 pb-12 min-h-screen">
        {children}
      </main>

      {/* Floating Kitchen Status Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-on-surface/90 text-surface px-8 py-4 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-8 border border-white/10 hidden md:flex">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed">restaurant</span>
          <span className="font-bold text-lg">Main Line Display</span>
        </div>
        <div className="h-6 w-px bg-white/20"></div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary-fixed">wifi</span>
          <span className="font-bold text-lg uppercase tracking-widest text-sm">Connected</span>
        </div>
        <div className="h-6 w-px bg-white/20"></div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-mono text-lg">LIVE</span>
        </div>
      </div>
    </div>
  );
}
