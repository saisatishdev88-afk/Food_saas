'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { fetchRazorpayConfig, updateRazorpayConfig } from '@/api/orders';

export default function RazorpaySetupPage() {
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    const [config, setConfig] = useState({
        key_id: '',
        key_secret: '',
        enabled: false,
        has_secret: false
    });

    const { data: serverConfig, isLoading } = useQuery({
        queryKey: ['razorpay-config'],
        queryFn: fetchRazorpayConfig
    });

    React.useEffect(() => {
        if (serverConfig) {
            setConfig({
                key_id: serverConfig.key_id || '',
                key_secret: '', // Keep blank on client for security
                enabled: !!serverConfig.enabled,
                has_secret: !!serverConfig.has_secret
            });
        }
    }, [serverConfig]);

    const mutation = useMutation({
        mutationFn: updateRazorpayConfig,
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['razorpay-config'] });
            setIsEditing(false);
            success('Razorpay credentials updated successfully.');
        },
        onError: (err: any) => {
            toastError(err.response?.data?.message || 'Failed to update credentials.');
        }
    });

    const handleSave = () => {
        if (!config.key_id.trim()) {
            toastError('Key ID is required.');
            return;
        }
        mutation.mutate({
            key_id: config.key_id,
            key_secret: config.key_secret || undefined, // Only send if edited
            enabled: config.enabled
        });
    };

    if (isLoading) return <div className="p-10 text-center animate-pulse italic opacity-20 uppercase tracking-widest text-[10px]">Verifying secure nodes...</div>;

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic leading-none">Razorpay <span className="text-blue-500 italic">Gateway</span></h2>
                    <p className="text-on-surface-variant font-medium text-sm mt-3 opacity-50">Configure your payment terminal, credentials, and digital ledger settings.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 border shadow-sm ${config.enabled ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{config.enabled ? 'Status: Active' : 'Status: Suspended'}</span>
                    </div>
                    <Button 
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? 'secondary' : 'default'}
                        className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] border-none"
                    >
                        {isEditing ? 'Discard Changes' : 'Update Credentials'}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Configuration Sidebar */}
                <div className="lg:col-span-2 space-y-10">
                    <Card className="p-10 rounded-[2.5rem] border border-outline-variant/5 shadow-sm space-y-8 bg-white">
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-4 flex-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">API Credentials</span>
                                <div className="h-px flex-1 bg-outline-variant/10"></div>
                            </div>
                            <button 
                                onClick={() => window.open('https://razorpay.com/docs/payments/dashboard/', '_blank')}
                                className="flex items-center gap-2 text-primary hover:underline"
                            >
                                <span className="material-symbols-outlined text-sm">help</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Guide</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Razorpay Key ID</label>
                                <input 
                                    disabled={!isEditing}
                                    value={config.key_id}
                                    onChange={(e) => setConfig({...config, key_id: e.target.value})}
                                    placeholder="rzp_test_..." 
                                    className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-40" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Razorpay Key Secret</label>
                                <div className="relative">
                                    <input 
                                        disabled={!isEditing}
                                        type="password"
                                        value={config.key_secret}
                                        onChange={(e) => setConfig({...config, key_secret: e.target.value})}
                                        placeholder={config.has_secret ? '••••••••••••••••' : 'Enter Secret Key'} 
                                        className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-40 pr-14" 
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30">vpn_key</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-outline-variant/5">
                            <div>
                                <h4 className="font-bold text-sm text-on-surface uppercase tracking-tight italic">Enable Gateway</h4>
                                <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1">Accept digital payments in checkout and POS terminals.</p>
                            </div>
                            <button
                                disabled={!isEditing}
                                onClick={() => setConfig({...config, enabled: !config.enabled})}
                                className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 disabled:opacity-40 ${config.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <span className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${config.enabled ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </button>
                        </div>

                        {isEditing && (
                            <Button 
                                onClick={handleSave}
                                disabled={mutation.isPending}
                                className="w-full h-16 bg-[#1a1c1d] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-600 transition-all border-none shadow-xl mt-4 relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {mutation.isPending && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                                    {mutation.isPending ? 'Syncing Credentials...' : 'Save Configuration'}
                                </div>
                            </Button>
                        )}
                    </Card>

                    <Card className="p-10 rounded-[2.5rem] bg-blue-50/50 border border-blue-100/50 shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight italic font-headline">Test Credentials Mode</h4>
                                <p className="text-[10px] font-bold text-blue-700/60 uppercase tracking-widest">Validating configuration and test runs.</p>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-blue-900/70 leading-relaxed uppercase tracking-wide">
                            When testing without custom API keys, the system falls back to default sandbox mock credentials. This allows you to verify checkout and POS flows without any setup hurdles.
                        </p>
                    </Card>
                </div>

                {/* Secondary Sidebar */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-[2rem] bg-[#1a1c1d] text-white border-none shadow-xl relative overflow-hidden h-fit">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-6">Payment Telemetry</p>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Total Settled</p>
                                <p className="text-3xl font-black italic tracking-tighter tabular-nums text-white">₹0.00</p>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Success Rate</p>
                                <p className="text-3xl font-black italic tracking-tighter tabular-nums text-emerald-400">100%</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Avg Settlement</p>
                                <p className="text-3xl font-black italic tracking-tighter tabular-nums text-primary">T+1 Day</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
