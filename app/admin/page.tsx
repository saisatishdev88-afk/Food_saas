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

        {/* Side Panels */}
        <div className="space-y-6">
            {stats.ai_insights && (
                <Card className="p-8 rounded-[2rem] bg-[#1a1c1d] text-white border border-primary/20 shadow-2xl relative overflow-hidden group h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Strategic Analysis</p>
                    </div>
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-2">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Best Performing Item</p>
                            <p className="text-xl font-bold italic text-white font-headline uppercase">{stats.ai_insights.best_item}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Peak Traffic</p>
                                <p className="text-sm font-bold text-emerald-400">{stats.ai_insights.peak_hours}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Slow Period</p>
                                <p className="text-sm font-bold text-amber-400">{stats.ai_insights.slow_hours}</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-primary mb-2">Suggested Action</p>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                                <p className="text-[11px] font-bold text-white/80">{stats.ai_insights.suggested_action}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-[-15%] bottom-[-15%] opacity-[0.03] text-[12rem] text-primary select-none group-hover:scale-110 transition-transform duration-700">
                        <span className="material-symbols-outlined italic">psychology</span>
                    </div>
                </Card>
            )}

            <Card className="p-8 rounded-[2rem] bg-white border border-outline-variant/10 shadow-sm relative overflow-hidden group h-fit">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mb-1">Active Subscription</p>
                        <h4 className="text-xl font-black text-on-surface uppercase italic font-headline">{stats.plan_type || 'Premium'} Package</h4>
                    </div>
                    <span className="bg-primary/10 text-primary text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                </div>
                
                <div className="space-y-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30">Purchased Modules</p>
                    <div className="flex flex-wrap gap-2">
                        {stats.modules && Object.entries(stats.modules)
                            .filter(([_, enabled]) => enabled)
                            .map(([key, _]) => (
                                <div key={key} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                                    <span className="text-[9px] font-bold text-on-surface uppercase tracking-tight">{key.replace('_', ' ')}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </Card>

            <Card className="p-6 rounded-2xl bg-white border border-outline-variant/10 shadow-sm flex items-center gap-4 group hover:translate-x-1 transition-transform cursor-pointer h-fit">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                </div>
                <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-on-surface">Node Settings</h4>
                    <p className="text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest mt-0.5">Terminal Identity</p>
                </div>
            </Card>
        </div>
      </section>
    </div>
  );
}
