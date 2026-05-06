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
          <p className="text-white/70 text-lg max-w-2xl font-medium">Your restaurant node is currently active and processing requests for {user?.tenant?.name || 'your restaurant'}.</p>
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
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest block">Todays Throughput</span>
            <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">Total: {dashboardData?.todays_orders || 0}</span>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-extrabold tracking-tighter text-on-surface animate-pulse">{liveOrders}</span>
              <span className="text-on-surface-variant font-bold text-sm uppercase tracking-tighter italic font-headline">Live Orders</span>
            </div>
            
            <div className="flex gap-2 border-t border-outline-variant/5 pt-4">
              <div className="flex-1 bg-slate-50 rounded-xl p-2 text-center border border-slate-100 flex flex-col justify-center">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-on-surface-variant/50">POS</span>
                  <span className="block text-lg font-black text-on-surface">{dashboardData?.orders_by_type?.pos || 0}</span>
              </div>
              <div className="flex-1 bg-blue-50/50 rounded-xl p-2 text-center border border-blue-100 flex flex-col justify-center">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-blue-500/60">QR/UPI</span>
                  <span className="block text-lg font-black text-blue-700">{dashboardData?.orders_by_type?.qr || 0}</span>
              </div>
              <div className="flex-1 bg-emerald-50/50 rounded-xl p-2 text-center border border-emerald-100 flex flex-col justify-center">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-emerald-500/60">WhatsApp</span>
                  <span className="block text-lg font-black text-emerald-700">{dashboardData?.orders_by_type?.whatsapp || 0}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest block mb-4">Estimated Yield</span>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-extrabold tracking-tighter text-on-surface">₹{estimatedYield.toFixed(2)}</span>
          </div>
        </Card>
      </div>      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-8 border-outline-variant/10 flex flex-col h-full">
            <h3 className="text-xl font-bold font-headline uppercase mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">campaign</span>
                Outlet Announcements
            </h3>
            <div className="space-y-4 flex-1">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-sm font-bold text-primary uppercase tracking-tight mb-1">System Notice</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Your node initialization is complete. You can now start adding your kitchen and floor staff.</p>
                </div>
            </div>
          </Card>

          {/* AI Strategic Insights - Conditional */}
          {dashboardData?.ai_insights && (
              <Card className="p-8 rounded-3xl bg-[#1a1c1d] text-white border border-primary/20 shadow-2xl relative overflow-hidden group h-full">
                  <div className="flex items-center gap-2 mb-6">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Strategic Analysis</p>
                  </div>
                  <div className="space-y-6 relative z-10">
                      <div className="space-y-1">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Best Item</p>
                          <p className="text-lg font-bold italic text-white font-headline uppercase">{dashboardData.ai_insights.best_item}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="space-y-1">
                              <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Peak</p>
                              <p className="text-sm font-bold text-emerald-400">{dashboardData.ai_insights.peak_hours}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Slow</p>
                              <p className="text-sm font-bold text-amber-400">{dashboardData.ai_insights.slow_hours}</p>
                          </div>
                      </div>
                  </div>
                  <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] text-[10rem] text-primary select-none group-hover:scale-110 transition-transform duration-700">
                      <span className="material-symbols-outlined italic">psychology</span>
                  </div>
              </Card>
          )}

          {/* Subscription Package Card */}
          <Card className="p-8 rounded-3xl bg-white border border-outline-variant/10 shadow-sm relative overflow-hidden group h-full">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mb-1">Active Subscription</p>
                      <h4 className="text-xl font-black text-on-surface uppercase italic font-headline leading-none">{dashboardData?.plan_type || 'Premium'}</h4>
                      {dashboardData?.subscription_expires_at && (
                          <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-2">
                              Expires: {new Date(dashboardData.subscription_expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                      )}
                  </div>
                  <span className="bg-primary/10 text-primary text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live</span>
              </div>
              
              <div className="space-y-4">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30">Node Modules</p>
                  <div className="flex flex-wrap gap-1.5">
                      {modules && Object.entries(modules)
                          .filter(([_, enabled]) => enabled)
                          .map(([key, _]) => (
                              <div key={key} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-primary/5 transition-colors">
                                  <span className="material-symbols-outlined text-[12px] text-primary">verified</span>
                                  <span className="text-[8px] font-bold text-on-surface uppercase tracking-tight">{key.replace('_', ' ')}</span>
                              </div>
                          ))
                      }
                  </div>
              </div>
          </Card>
      </section>

      {/* Inventory & Other Systems */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
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
