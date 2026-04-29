'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTenants, createTenant } from '@/api/saas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';

export default function SaasRestaurantManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { success, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    email: '',
    plan_type: 'basic',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    modules: {
      qr_menu: false,
      inventory: false,
      shift_management: false,
      ai_assistant: false,
    }
  });
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenants', page, debouncedSearch],
    queryFn: () => fetchTenants(page, debouncedSearch),
  });

  // Reset page when searching
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const mutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        domain: '', 
        email: '', 
        plan_type: 'basic',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        modules: {
          qr_menu: false,
          inventory: false,
          shift_management: false,
          ai_assistant: false,
        }
      });
      setFormError('');
      success('Node successfully onboarded to the network.');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to onboard restaurant');
      toastError(err.response?.data?.message || 'Failed to onboard node');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            modules: {
                ...prev.modules,
                [name]: checked
            }
        }));
    } else if (name === 'plan_type') {
        const isBasic = value === 'basic';
        setFormData(prev => ({
            ...prev,
            [name]: value,
            modules: isBasic ? {
                qr_menu: false,
                inventory: false,
                shift_management: false,
                ai_assistant: false,
            } : prev.modules
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    mutation.mutate(formData);
  };

  const tenants = data?.data || [];
  const totalPages = data?.last_page || 1;

  return (
    <div className="p-8 lg:p-12 max-w-[1500px] mx-auto w-full space-y-10 animate-in fade-in duration-500">
      {/* Sleek Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic">Restaurant <span className="text-primary italic">Network</span></h2>
          <p className="text-on-surface-variant font-medium text-sm opacity-50">Global node registry and commercial index for the Atelier ecosystem.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30 group-focus-within:text-primary transition-all">search</span>
                <input 
                    type="text" 
                    placeholder="Search nodes..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-14 pl-12 pr-6 bg-white border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-xs uppercase tracking-widest w-64 shadow-sm"
                />
            </div>
            <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#1a1c1d] text-white px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none shadow-2xl hover:bg-primary transition-all active:scale-95"
            >
                Onboard Node
            </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-outline-variant/5 overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-[#fcfdff] border-b border-outline-variant/5 text-on-surface-variant uppercase text-[9px] font-black tracking-[0.2em]">
              <th className="py-6 px-10 w-[30%]">Brand Identity</th>
              <th className="py-6 px-10 w-[15%]">Gross Revenue</th>
              <th className="py-6 px-10 w-[15%]">Orders</th>
              <th className="py-6 px-10 w-[15%]">Status</th>
              <th className="py-6 px-10 w-[12%]">Tier</th>
              <th className="py-6 px-10 w-[13%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {isLoading ? (
              <tr><td colSpan={6} className="py-24 text-center font-black uppercase tracking-widest text-[10px] opacity-20">Synchronizing global registry...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan={6} className="py-24 text-center italic opacity-20">No matching restaurant nodes detected.</td></tr>
            ) : tenants.map((tenant: any) => (
              <tr key={tenant.id} className="hover:bg-[#fcfdff] transition-all group">
                <td className="py-8 px-10">
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-outline-variant/10 flex items-center justify-center text-on-surface-variant font-black text-lg group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                      {tenant.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-on-surface text-base tracking-tighter truncate italic font-headline">{tenant.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40 truncate">{tenant.domain}.foodsoul.io</p>
                    </div>
                  </div>
                </td>
                <td className="py-8 px-10">
                  <div className="flex flex-col">
                      <span className="font-black text-on-surface text-xl tabular-nums tracking-tighter italic font-headline">₹{(tenant.orders_sum_total_amount || 0).toLocaleString()}</span>
                      <span className="text-[8px] font-black text-on-surface-variant uppercase opacity-30 mt-0.5 whitespace-nowrap">Lifetime Value</span>
                  </div>
                </td>
                <td className="py-8 px-10">
                  <div className="flex flex-col">
                      <span className="font-black text-on-surface text-xl tabular-nums tracking-tighter italic font-headline">{tenant.orders_count || 0}</span>
                      <span className="text-[8px] font-black text-on-surface-variant uppercase opacity-30 mt-0.5">Transactions</span>
                  </div>
                </td>
                <td className="py-8 px-10">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ${
                    tenant.status === 'active' || !tenant.status ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/50' : 'bg-red-50 text-red-700 ring-red-200/50'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${tenant.status === 'active' || !tenant.status ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {(tenant.status || 'ACTIVE')}
                  </span>
                </td>
                <td className="py-8 px-10">
                  <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-outline-variant/5">
                    {tenant.plan_type}
                  </span>
                </td>
                <td className="py-8 px-10 text-right">
                  <div className="flex justify-end gap-3 opacity-100 transition-opacity">
                      <button className="w-10 h-10 rounded-xl bg-white border border-outline-variant/10 text-on-surface-variant flex items-center justify-center hover:bg-[#1a1c1d] hover:text-white transition-all shadow-sm">
                          <span className="material-symbols-outlined text-lg">edit_document</span>
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <span className="material-symbols-outlined text-lg">delete_sweep</span>
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sleek Pagination Footer */}
        {totalPages > 1 && (
            <footer className="px-10 py-8 bg-[#fcfdff] border-t border-outline-variant/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Page {data?.current_page} of {totalPages}</span>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="h-10 px-6 rounded-xl border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm bg-white"
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                        className="h-10 px-6 rounded-xl border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white disabled:opacity-30 transition-all shadow-sm bg-white"
                    >
                        Next Channel
                    </button>
                </div>
            </footer>
        )}
      </div>

      {/* Onboarding Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white/10">
            <header className="bg-[#1a1c1d] p-12 text-white relative overflow-hidden">
              <h3 className="text-3xl font-black font-headline uppercase italic tracking-tighter">Onboard <span className="text-primary italic">Node</span></h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Initialize a secure business instance on the global network.</p>
              <div className="absolute right-[-10%] top-[-10%] opacity-10 text-[10rem] text-primary select-none">
                <span className="material-symbols-outlined italic">add_business</span>
              </div>
            </header>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              {formError && (
                <div className="p-4 bg-red-50 text-red-700 text-[10px] font-black rounded-2xl border border-red-100 uppercase tracking-widest leading-relaxed">
                  [Error] {formError}
                </div>
              )}

              {/* Business Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">01 Phase</span>
                  <div className="h-px flex-1 bg-outline-variant/10"></div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Entity Name</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Restaurant Name" className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-black text-sm uppercase tracking-tight text-on-surface" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Node Prefix (Domain)</label>
                    <input required name="domain" value={formData.domain} onChange={handleInputChange} placeholder="prefix" className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-black text-sm lowercase tracking-tight text-on-surface italic" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Official Email</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contact@domain.com" className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Service Architecture</label>
                        <select name="plan_type" value={formData.plan_type} onChange={handleInputChange} className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-black text-[10px] uppercase tracking-widest appearance-none text-on-surface" >
                            <option value="basic">Standard Tier</option>
                            <option value="premium">Growth Tier</option>
                            <option value="pro">Enterprise Tier</option>
                        </select>
                    </div>
                </div>
              </div>

              {/* Administrative Lead */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">02 Phase</span>
                  <div className="h-px flex-1 bg-outline-variant/10"></div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Admin Identity Name</label>
                    <input required name="owner_name" value={formData.owner_name} onChange={handleInputChange} placeholder="Full Name" className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Primary Command Email</label>
                    <input required type="email" name="owner_email" value={formData.owner_email} onChange={handleInputChange} placeholder="admin@domain.com" className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Secure Passkey</label>
                    <input required type="password" name="owner_password" value={formData.owner_password} onChange={handleInputChange} placeholder="••••••••" className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface" />
                  </div>
                </div>
              </div>

              {/* Modules Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">03 Phase</span>
                  <div className="h-px flex-1 bg-outline-variant/10"></div>
                </div>
                {formData.plan_type === 'basic' ? (
                  <div className="p-6 bg-slate-50 border border-outline-variant/10 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-30 mb-2">extension_off</span>
                    <p className="text-sm font-bold text-on-surface uppercase tracking-tight">Add-on Modules Unavailable</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mt-1">Upgrade to Growth or Enterprise tier to enable additional features.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/10 bg-slate-50 cursor-pointer hover:border-primary transition-all">
                          <input type="checkbox" name="qr_menu" checked={formData.modules.qr_menu} onChange={handleInputChange} className="w-5 h-5 accent-primary" />
                          <div className="flex flex-col">
                              <span className="text-xs font-black uppercase tracking-widest text-on-surface">QR Ordering</span>
                              <span className="text-[9px] font-bold text-on-surface-variant">Table-side self service</span>
                          </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/10 bg-slate-50 cursor-pointer hover:border-primary transition-all">
                          <input type="checkbox" name="inventory" checked={formData.modules.inventory} onChange={handleInputChange} className="w-5 h-5 accent-primary" />
                          <div className="flex flex-col">
                              <span className="text-xs font-black uppercase tracking-widest text-on-surface">Inventory Management</span>
                              <span className="text-[9px] font-bold text-on-surface-variant">Track ingredients & stock</span>
                          </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/10 bg-slate-50 cursor-pointer hover:border-primary transition-all">
                          <input type="checkbox" name="shift_management" checked={formData.modules.shift_management} onChange={handleInputChange} className="w-5 h-5 accent-primary" />
                          <div className="flex flex-col">
                              <span className="text-xs font-black uppercase tracking-widest text-on-surface">Shift Management</span>
                              <span className="text-[9px] font-bold text-on-surface-variant">Staff clock-in/out tracking</span>
                          </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/10 bg-slate-50 cursor-pointer hover:border-primary transition-all">
                          <input type="checkbox" name="ai_assistant" checked={formData.modules.ai_assistant} onChange={handleInputChange} className="w-5 h-5 accent-primary" />
                          <div className="flex flex-col">
                              <span className="text-xs font-black uppercase tracking-widest text-on-surface">AI Chat Assistant</span>
                              <span className="text-[9px] font-bold text-on-surface-variant">Intelligent analytics & reporting</span>
                          </div>
                      </label>
                  </div>
                )}
              </div>

              <div className="flex gap-6 pt-10">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1 h-16 rounded-2xl ftext-[10px] font-black uppercase tracking-widest border-outline-variant/10 text-on-surface-variant" > Abort Request </Button>
                <Button type="submit" disabled={mutation.isPending} className="flex-1 h-16 bg-[#1a1c1d] text-on-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all border-none shadow-2xl" > {mutation.isPending ? 'Propagating...' : 'Onboard Command Node'} </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
