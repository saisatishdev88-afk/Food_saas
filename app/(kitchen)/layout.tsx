import Link from 'next/link';
import React from 'react';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#fcfdff] min-h-screen">
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
