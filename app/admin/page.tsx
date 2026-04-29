'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Card } from '@/components/ui/Card';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/dashboard');
      return data;
    }
  });

  if (isLoading) return <div className="p-10 text-center font-bold uppercase tracking-widest text-[10px] opacity-20 italic">Scanning Nodal Data...</div>;

  return (
    <div className="p-6 lg:p-10 max-w-[1500px] mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/10 pb-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase text-on-surface leading-none">Command <span className="text-primary">Center</span></h1>
            <p className="text-on-surface-variant font-medium text-[11px] mt-1.5 opacity-60">High-fidelity operational telemetry for this restaurant node.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Node Signal: Optimial</span>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
        <Card className="p-6 bg-[#1a1c1d] border-none shadow-xl text-white rounded-3xl relative overflow-hidden">
            <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-3 block opacity-80">Gross Revenue</p>
            <p className="text-3xl font-bold italic tracking-tighter text-white tabular-nums">₹{stats.total_revenue?.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-white border border-outline-variant/10 shadow-sm rounded-3xl">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-40">Today's Dispatch</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface italic tracking-tight tabular-nums">{stats.todays_orders}</span>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Nodes</span>
            </div>
        </Card>
        <Card className="p-6 bg-white border border-outline-variant/10 shadow-sm rounded-3xl">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-40">Daily Yield</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface italic tracking-tight tabular-nums">₹{stats.todays_revenue?.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Net</span>
            </div>
        </Card>
        <Card className="p-6 bg-white border border-outline-variant/10 shadow-sm rounded-3xl">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-40">Global Volume</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface italic tracking-tight tabular-nums">{stats.total_orders}</span>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Signals</span>
            </div>
        </Card>
        <Card className="p-6 bg-white border border-outline-variant/10 shadow-sm rounded-3xl">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-40">Personnel Nodes</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface italic tracking-tight tabular-nums">{stats.total_staff || 0}</span>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Staff</span>
            </div>
        </Card>
        <Card className="p-6 bg-white border border-outline-variant/10 shadow-sm rounded-3xl">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-40">Catalog Size</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface italic tracking-tight tabular-nums">{stats.total_items || 0}</span>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">SKUs</span>
            </div>
        </Card>
      </section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm space-y-6 bg-white h-fit">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h2 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant opacity-60">High-Fidelity Traffic Node</h2>
                <span className="text-[9px] font-bold text-primary uppercase bg-primary/5 px-3 py-1 rounded-full">Live Monitor</span>
            </div>
            <div className="space-y-4">
                {stats.recent_orders?.map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center group cursor-default p-3 rounded-xl hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            </div>
                            <div>
                                <p className="font-bold text-on-surface uppercase text-[13px] tracking-tight">#{order.order_number}</p>
                                <p className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-base font-bold text-on-surface italic tabular-nums">₹{Number(order.total_amount).toFixed(2)}</p>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/60">VERIFIED</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {/* AI Sidebar */}
        <div className="space-y-6">
            <Card className="p-8 rounded-[2rem] bg-[#1a1c1d] text-white border-none shadow-xl relative overflow-hidden group h-fit">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-5">Predictive Logic</p>
                <div className="space-y-5 relative z-10">
                    <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[16px]">trending_up</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-tight mb-1">{stats.ai_forecast?.trend || 'Surge Prediction'}</p>
                            <p className="text-[10px] font-medium text-white/40 leading-relaxed italic">Peak expected at {stats.ai_forecast?.peak_hour}. {stats.ai_forecast?.staff_suggestion}.</p>
                        </div>
                    </div>
                </div>
                <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.05] text-[10rem] text-primary select-none">
                    <span className="material-symbols-outlined italic">bolt</span>
                </div>
            </Card>

            <Card className="p-6 rounded-2xl bg-white border border-outline-variant/10 shadow-sm flex items-center gap-4 group hover:translate-x-1 transition-transform cursor-pointer h-fit">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                </div>
                <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase">Node Settings</h4>
                    <p className="text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest mt-0.5">Terminal Identity</p>
                </div>
            </Card>
        </div>
      </section>
    </div>
  );
}
