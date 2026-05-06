'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { fetchSaaSStats, fetchTenants } from '@/api/saas';

export default function SaasDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['saas-stats'],
    queryFn: fetchSaaSStats,
    refetchInterval: 30000,
  });

  const { data: tenantData, isLoading: tenantsLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => fetchTenants(1),
  });

  const tenants = tenantData?.data || [];
  
  const recentActivities = tenants.slice(0, 4).map((t: any) => ({
    id: t.id,
    type: 'onboarding',
    title: 'Node Pulse',
    message: `${t.name} initialized. Domain routing active.`,
    time: 'Live'
  }));

  const aiForecast = stats?.ai_forecast || {
    demand: { peak_hour: '...', trend: '...', staff_suggestion: '...' },
    alerts: []
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1500px] mx-auto w-full space-y-12">
      {/* Sleek Minimal Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-outline-variant/10">
        <div className="relative">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block opacity-60">SaaS Command Center</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface font-headline uppercase italic leading-none">Network <span className="text-primary italic">Intelligence</span></h1>
          <p className="text-on-surface-variant text-sm font-medium mt-1 opacity-50 italic">Aggregated operational telemetry and growth metrics.</p>
        </div>
        <div className="flex gap-4">
            <div className={`px-5 py-2.5 rounded-xl flex items-center gap-3 border shadow-sm transition-all ${stats?.system_health === 'optimal' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                <div className={`w-2 h-2 rounded-full ${stats?.system_health === 'optimal' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Network Status: {stats?.system_health?.toUpperCase() || 'SEARCHING...'}</span>
            </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 bg-white border border-outline-variant/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative text-left">
          <div className="relative z-10">
            <span className="text-on-surface-variant font-black text-[9px] uppercase tracking-[0.3em] mb-4 opacity-40">Restaurant Nodes</span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tighter text-on-surface italic font-headline leading-none">
                {statsLoading ? '...' : stats?.total_restaurants ?? 0}
              </span>
              <span className="text-emerald-600 font-black text-[9px] bg-emerald-50 px-2 py-0.5 rounded-lg">
                +4% SCALE
              </span>
            </div>
            <p className="mt-4 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none">Fully onboarded business entities</p>
          </div>
          <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] text-[10rem] group-hover:scale-110 group-hover:rotate-12 transition-all">
             <span className="material-symbols-outlined">hub</span>
          </div>
        </Card>

        <Card className="p-8 bg-[#1a1c1d] border-none shadow-2xl group overflow-hidden relative text-left">
          <div className="relative z-10">
            <span className="text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-4 block px-3 py-1 bg-primary/10 w-fit rounded-full">Network MRR (INR)</span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tighter text-white italic font-headline leading-none">
                ₹{statsLoading ? '...' : (stats?.global_revenue ?? 0).toLocaleString()}
              </span>
              <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest">/ Mo</span>
            </div>
          </div>
          <div className="absolute right-[-10%] top-[-10%] opacity-15 text-[10rem] text-primary group-hover:scale-105 transition-all">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </Card>

        <Card className="p-8 bg-white border border-outline-variant/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative text-left">
          <div className="relative z-10">
            <span className="text-on-surface-variant font-black text-[9px] uppercase tracking-[0.3em] mb-4 opacity-40">Staff Ecosystem</span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tighter text-on-surface italic font-headline leading-none">
                {statsLoading ? '...' : (stats?.total_users ?? 0).toLocaleString()}
              </span>
            </div>
            <p className="mt-4 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none">Managed personnel nodes</p>
          </div>
          <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] text-[10rem] group-hover:scale-110 transition-all">
             <span className="material-symbols-outlined">shield_person</span>
          </div>
        </Card>
      </section>

      {/* AI OPERATIONS & PULSE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* AI Operations Module - 7/12 col */}
        <Card className="lg:col-span-7 bg-[#fcfdff] border-primary/10 border-2 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h3 className="text-2xl font-black font-headline uppercase italic text-on-surface flex items-center gap-3">
                             <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                             </div>
                             AI Operations <span className="text-primary italic animate-pulse lowercase font-sans text-xs font-bold tracking-widest ml-2 px-2 py-1 bg-primary/5 border border-primary/10 rounded-lg">Active Pulse</span>
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Feature 1: Demand Forecast */}
                    <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm space-y-4 group/box hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">insights</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Demand Forecast</span>
                        </div>
                        <div>
                             <p className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit mb-3">Peak expectations at {aiForecast.demand.peak_hour}</p>
                             <p className="text-lg font-black tracking-tighter text-on-surface italic font-headline">{aiForecast.demand.trend}</p>
                             <p className="text-[10px] text-on-surface-variant font-medium mt-1 uppercase tracking-widest">{aiForecast.demand.staff_suggestion}</p>
                        </div>
                        <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-indigo-500 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Feature 2: Smart Alerts */}
                    <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm space-y-4 group/box hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">notifications_active</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Active Intelligence</span>
                        </div>
                        <div className="space-y-3">
                            {aiForecast.alerts.map((alert: any, i: number) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded-xl hover:bg-orange-50 transition-colors cursor-default">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                                    <p className="text-[11px] font-bold text-on-surface leading-tight">{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute right-[-5%] bottom-[-5%] opacity-[0.03] text-[20rem] italic font-headline pointer-events-none select-none">
                PREDICT
            </div>
        </Card>

        {/* Global Activity Pulse - 5/12 col */}
        <Card className="lg:col-span-5 bg-white border border-outline-variant/10 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden flex flex-col">
            <h3 className="text-lg font-black font-headline uppercase italic mb-8 flex items-center gap-4">
                <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">history</span>
                </span>
                Payment Pulse
            </h3>
            <div className="flex-1 space-y-4 relative">
                {stats?.ai_forecast?.payment_history?.map((pay: any) => (
                    <div key={pay.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-outline-variant/5">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pay.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <span className="material-symbols-outlined text-sm">{pay.status === 'success' ? 'check_circle' : 'cancel'}</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-tight text-on-surface">{pay.restaurant}</p>
                                <p className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{pay.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-on-surface tabular-nums">₹{pay.amount.toLocaleString()}</p>
                            <span className={`text-[8px] font-bold uppercase tracking-widest ${pay.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{pay.status}</span>
                        </div>
                    </div>
                ))}
                {!stats?.ai_forecast?.payment_history && (
                    <div className="py-10 text-center opacity-20 italic text-[10px] uppercase font-black tracking-widest">No Recent Flow Detected</div>
                )}
            </div>
            <Button variant="ghost" className="mt-8 w-full h-11 border border-outline-variant/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Full Revenue Audit</Button>
        </Card>
      </section>
    </div>
  );
}
