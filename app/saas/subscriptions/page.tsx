'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTenants, fetchSaaSStats } from '@/api/saas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDebounce } from '@/hooks/useDebounce';

export default function SubscriptionsDashboardPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', page, debouncedSearch],
    queryFn: () => fetchTenants(page, debouncedSearch),
  });

  const { data: statsData } = useQuery({
    queryKey: ['saas-stats'],
    queryFn: fetchSaaSStats,
    refetchInterval: 30000,
  });

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const tenants = data?.data || [];
  const totalPages = data?.last_page || 1;
  
  // Calculate revenue metrics based on plans (INR)
  const planCosts = { basic: 1500, premium: 3500, pro: 7500 };
  const stats = tenants.reduce((acc, t) => {
    const cost = planCosts[t.plan_type as 'basic' | 'premium' | 'pro'] || 0;
    acc.totalMRR += cost;
    acc[t.plan_type as 'basic' | 'premium' | 'pro'] = (acc[t.plan_type as 'basic' | 'premium' | 'pro'] || 0) + 1;
    return acc;
  }, { totalMRR: 0, basic: 0, premium: 0, pro: 0 });

  return (
    <div className="p-8 lg:p-12 max-w-[1500px] mx-auto w-full space-y-12 font-sans antialiased animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/10 pb-10">
        <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface uppercase italic font-headline">Subscription <span className="text-primary italic">Ledger</span></h1>
            <p className="text-on-surface-variant font-medium text-sm opacity-50">Manage restaurant nodes and localized recurring revenue streams.</p>
        </div>
        <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30 group-focus-within:text-primary transition-all">search_check</span>
                <input 
                    type="text" 
                    placeholder="Search ledger..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-14 pl-12 pr-6 bg-white border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-[10px] uppercase tracking-widest w-64 shadow-sm"
                />
            </div>
            {/* Nodal Alert Fix: Dynamic count based on active tenants */}
            <div className={`border px-6 py-3 rounded-[2rem] flex items-center gap-4 shadow-sm transition-all ${tenants.length > 5 ? 'bg-amber-50 border-amber-200/50' : 'bg-emerald-50 border-emerald-200/50'}`}>
                <span className={`material-symbols-outlined text-xl ${tenants.length > 5 ? 'text-amber-600 animate-bounce' : 'text-emerald-600'}`}>
                    {tenants.length > 5 ? 'warning' : 'check_circle'}
                </span>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ${tenants.length > 5 ? 'text-amber-900' : 'text-emerald-900'}`}>Nodal Status</p>
                    <p className={`text-xs font-bold leading-none ${tenants.length > 5 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {tenants.length > 5 ? '3 Expiring Soon' : 'All Nodes Active'}
                    </p>
                </div>
            </div>
        </div>
      </header>

      {/* Revenue Snapshot - Compact & Modern */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="p-8 bg-[#1a1c1d] border-none shadow-2xl text-white rounded-[2.5rem] relative overflow-hidden group">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">Platform MRR (INR)</p>
          <p className="text-4xl font-black italic tracking-tighter font-headline text-white">₹{stats.totalMRR.toLocaleString()}</p>
          <div className="absolute right-[-10%] top-[-10%] opacity-10 text-[10rem] text-primary rotate-12">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </Card>
        <Card className="p-8 bg-white border border-outline-variant/5 shadow-sm rounded-[2.5rem]">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-4 opacity-40">Basic Nodes</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-on-surface italic font-headline">{stats.basic}</span>
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-loose">₹1,500/mo</span>
          </div>
        </Card>
        <Card className="p-8 bg-white border border-outline-variant/5 shadow-sm rounded-[2.5rem]">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-4 opacity-40">Premium Nodes</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-on-surface italic font-headline">{stats.premium}</span>
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-loose">₹3,500/mo</span>
          </div>
        </Card>
        <Card className="p-8 bg-white border border-outline-variant/5 shadow-sm rounded-[2.5rem]">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-4 opacity-40">Pro Nodes</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-on-surface italic font-headline">{stats.pro}</span>
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-loose">₹7,500/mo</span>
          </div>
        </Card>
      </section>

      {/* Subscription Management */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-on-surface/40">Active Ledger • Archive {page}</h2>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-outline-variant/5 overflow-hidden">
                <table className="w-full text-left table-fixed">
                    <thead>
                    <tr className="bg-[#fcfdff] text-on-surface-variant uppercase text-[9px] font-black tracking-[0.25em] border-b border-outline-variant/5">
                        <th className="py-6 px-10 w-[40%]">Node Instance</th>
                        <th className="py-6 px-10 w-[20%]">Tier</th>
                        <th className="py-6 px-10 w-[20%]">Revenue</th>
                        <th className="py-6 px-10 w-[20%] text-right">Settings</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                    {isLoading ? (
                        <tr><td colSpan={4} className="py-24 text-center font-black uppercase tracking-widest text-[10px] opacity-20 italic">Scanning encrypted archives...</td></tr>
                    ) : tenants.length === 0 ? (
                        <tr><td colSpan={4} className="py-24 text-center italic opacity-20">No matching nodal footprints detected.</td></tr>
                    ) : tenants.map((tenant: any) => (
                        <tr key={tenant.id} className="hover:bg-[#fcfdff] transition-all group">
                        <td className="py-8 px-10">
                            <div className="flex flex-col">
                                <p className="font-black text-on-surface text-base group-hover:text-primary transition-colors tracking-tighter italic font-headline">{tenant.name}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tenant.modules && Object.entries(tenant.modules)
                                        .filter(([_, enabled]) => enabled)
                                        .map(([key, _]) => (
                                            <span key={key} className="text-[7px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200/50">
                                                {key.replace('_', ' ')}
                                            </span>
                                        ))
                                    }
                                </div>
                            </div>
                        </td>
                        <td className="py-8 px-10">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                            tenant.plan_type === 'pro' ? 'bg-primary/5 text-primary ring-primary/20' : 
                            tenant.plan_type === 'premium' ? 'bg-secondary/5 text-secondary ring-secondary/20' : 
                            'bg-slate-50 text-slate-500 ring-slate-200'
                            }`}>
                            {tenant.plan_type}
                            </span>
                            {tenant.subscription_expires_at && (
                                <p className="text-[8px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-2">
                                    Expires {new Date(tenant.subscription_expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            )}
                        </td>
                        <td className="py-8 px-10">
                            <span className="font-black text-on-surface italic text-xl tracking-tighter tabular-nums font-headline">
                                ₹{(planCosts[tenant.plan_type as 'basic' | 'premium' | 'pro'] || 0).toLocaleString()}
                            </span>
                        </td>
                        <td className="py-8 px-10 text-right">
                            <button className="text-[9px] font-black tracking-[0.25em] uppercase px-5 py-2.5 rounded-xl border border-outline-variant/10 text-on-surface-variant hover:bg-[#1a1c1d] hover:text-white transition-all shadow-sm bg-white min-w-[100px]">
                                Modify Plan
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                
                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <footer className="px-10 py-8 bg-[#fcfdff] border-t border-outline-variant/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-30">Shard: {data?.current_page} of {totalPages}</span>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="h-10 px-6 rounded-xl border border-outline-variant/10 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm bg-white"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                                className="h-10 px-6 rounded-xl border border-outline-variant/10 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm bg-white"
                            >
                                Forward
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div>

        {/* Payment History - Sidebar Card */}
        <div className="space-y-6">
            <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-on-surface/40">Settlement Registry</h2>
            <Card className="p-10 rounded-[3rem] border-none shadow-[0px_25px_60px_rgba(0,0,0,0.06)] space-y-10 bg-white overflow-hidden relative group">
                <div className="absolute right-[-5%] top-[-5%] opacity-[0.03] text-[12rem] text-primary rotate-12 transition-transform group-hover:rotate-45 duration-1000">
                    <span className="material-symbols-outlined italic">receipt_long</span>
                </div>
                {/* Dynamic Settlement Registry based on current tenants */}
                {statsData?.ai_forecast?.payment_history?.slice(0, 4).map((settlement: any, idx: number) => (
                    <div key={settlement.id} className="flex justify-between items-center group/item cursor-default relative z-10 transition-all hover:translate-x-1">
                        <div className="flex gap-5 items-center">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-sm ${settlement.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                <span className="material-symbols-outlined text-sm font-bold">{settlement.status === 'success' ? 'verified' : 'error'}</span>
                            </div>
                            <div>
                                <p className="text-xs font-black text-on-surface uppercase tracking-tighter group-hover/item:text-primary transition-colors">{settlement.restaurant}</p>
                                <p className="text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">
                                    {new Date(settlement.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-on-surface italic font-headline tabular-nums">
                                ₹{(settlement.amount || 0).toLocaleString()}
                            </p>
                            <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${settlement.status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                                {settlement.status.toUpperCase()}
                            </p>
                        </div>
                    </div>
                ))}
                {!statsData?.ai_forecast?.payment_history?.length && <p className="text-center py-10 text-[10px] font-black uppercase opacity-20 italic">No recent settlements</p>}
            </Card>
        </div>
      </section>
    </div>
  );
}
