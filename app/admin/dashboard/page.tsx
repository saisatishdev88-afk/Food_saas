'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export default function TenantDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: dashboardData } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: async () => {
      const response = await api.get('/tenant/dashboard');
      return response.data;
    }
  });

  const staffCount = dashboardData?.total_staff || 0;
  const liveOrders = dashboardData?.live_orders || 0;
  const estimatedYield = dashboardData?.todays_revenue || 0;
  const lowStockItems = dashboardData?.low_stock_items || [];
  const modules = dashboardData?.modules || {};

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto w-full space-y-12">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-[#2c2f30] to-[#1a1c1d] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 font-headline uppercase italic">Welcome Back, {user?.name}</h2>
          <p className="text-white/70 text-lg max-w-2xl font-medium">Your restaurant node is currently active and processing requests on the Foodsoul Network.</p>
        </div>
        <div className="absolute right-[-5%] top-[-10%] opacity-10 text-[20rem]">
            <span className="material-symbols-outlined text-white">restaurant</span>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest block mb-4">Personnel Authorized</span>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-extrabold tracking-tighter text-primary">{staffCount}</span>
            <span className="text-on-surface-variant font-bold text-sm uppercase tracking-tighter italic">Active Staff</span>
          </div>
        </Card>

        <Card className="p-8 border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest block mb-4">Todays Throughput</span>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-extrabold tracking-tighter text-on-surface animate-pulse">{liveOrders}</span>
            <span className="text-on-surface-variant font-bold text-sm uppercase tracking-tighter italic font-headline">Live Orders</span>
          </div>
        </Card>

        <Card className="p-8 border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest block mb-4">Estimated Yield</span>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-extrabold tracking-tighter text-on-surface">₹{estimatedYield.toFixed(2)}</span>
          </div>
        </Card>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 border-outline-variant/10 flex flex-col">
            <h3 className="text-xl font-bold font-headline uppercase mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">campaign</span>
                Outlet Announcements
            </h3>
            <div className="space-y-4 flex-1">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-sm font-bold text-primary uppercase tracking-tight mb-1">System Notice</p>
                    <p className="text-sm text-on-surface-variant">Your node initialization is complete. You can now start adding your kitchen and floor staff.</p>
                </div>
            </div>
          </Card>

          {modules.inventory && (
              <Card className="p-8 border-outline-variant/10 flex flex-col">
                  <h3 className="text-xl font-bold font-headline uppercase mb-6 flex items-center gap-3 text-red-600">
                      <span className="material-symbols-outlined">warning</span>
                      Inventory Alerts
                  </h3>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
                      {lowStockItems.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 grayscale opacity-40">
                              <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                              <p className="font-bold text-xs uppercase tracking-widest">Stock Levels Optimal</p>
                          </div>
                      ) : (
                          lowStockItems.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                                  <div>
                                      <p className="text-sm font-bold text-red-900 uppercase tracking-tight">{item.name}</p>
                                      <p className="text-[10px] text-red-700/70 font-black uppercase tracking-widest mt-0.5">Threshold: {item.alert_threshold}</p>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-2xl font-black text-red-600 italic tracking-tighter">{item.stock_level}</span>
                                      <span className="block text-[8px] uppercase tracking-widest text-red-500 font-bold">In Stock</span>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </Card>
          )}

          {!modules.inventory && (
              <Card className="p-8 border-outline-variant/10 bg-surface-container-low/30 border-dashed border-2">
                <div className="h-full flex flex-col items-center justify-center text-center p-6 grayscale opacity-40">
                    <span className="material-symbols-outlined text-6xl mb-4">query_stats</span>
                    <p className="font-bold text-sm uppercase tracking-widest">Growth Charts Coming Soon</p>
                </div>
              </Card>
          )}
      </section>
    </div>
  );
}
