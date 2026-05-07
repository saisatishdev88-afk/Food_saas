import { TenantGuard } from '@/components/auth/TenantGuard';
import React from 'react';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantGuard>
      <div className="bg-[#fcfdff] min-h-screen">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </TenantGuard>
  );
}
