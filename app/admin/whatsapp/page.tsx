'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function WhatsAppSetupPage() {
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['tenant-dashboard'],
        queryFn: async () => {
            const { data } = await api.get('/tenant/dashboard');
            return data;
        }
    });

    const [config, setConfig] = useState({
        business_number: '',
        instance_id: '',
        api_key: '',
        webhook_token: '',
        welcome_message: 'Hi 👋 Welcome to our restaurant!\n\nReply:\n1 for Menu\n2 to Track Order',
        status: 'not_connected'
    });

    // Sync config from dashboard data when loaded
    React.useEffect(() => {
        if (dashboardData?.tenant?.whatsapp_config) {
            setConfig(prev => ({
                ...prev,
                ...dashboardData.tenant.whatsapp_config
            }));
        }
    }, [dashboardData]);

    const mutation = useMutation({
        mutationFn: async (newConfig: any) => {
            return await api.post('/tenant/whatsapp/config', newConfig);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenant-dashboard'] });
            // Sync local state immediately
            if (response.data?.config) {
                setConfig(prev => ({ ...prev, ...response.data.config }));
            }
            setIsEditing(false);
            success('WSAPI configuration updated successfully.');
        },
        onError: () => {
            toastError('Failed to update WSAPI configuration.');
        }
    });

    const handleSave = () => {
        mutation.mutate(config);
    };

    const modules = dashboardData?.modules || {};
    const isWhatsAppEnabled = modules.whatsapp_ordering;

    if (isLoading) return <div className="p-10 text-center animate-pulse italic opacity-20 uppercase tracking-widest text-[10px]">Accessing Secure Protocols...</div>;

    if (!isWhatsAppEnabled) {
        return (
            <div className="p-10 max-w-4xl mx-auto space-y-10">
                <Card className="p-12 bg-[#1a1c1d] text-white rounded-[3rem] text-center border-none shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto text-primary">
                            <span className="material-symbols-outlined text-4xl">lock</span>
                        </div>
                        <h2 className="text-3xl font-black font-headline uppercase italic">Module Restricted</h2>
                        <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">
                            The WhatsApp Food Ordering Module is not part of your current node architecture. 
                            Upgrade to <span className="text-primary italic font-bold">Enterprise Tier</span> or contact your SaaS Admin to enable this protocol.
                        </p>
                        <Button className="bg-primary text-white px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform border-none">
                            Upgrade Now
                        </Button>
                    </div>
                    <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] text-[20rem] text-primary rotate-12 select-none">
                        <span className="material-symbols-outlined">chat</span>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic leading-none">WSAPI <span className="text-green-500 italic">Interface</span></h2>
                    <p className="text-on-surface-variant font-medium text-sm mt-3 opacity-50">Manage your autonomous WSAPI.chat agent and order distribution.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 border shadow-sm ${config.status === 'connected' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${config.status === 'connected' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{config.status === 'connected' ? 'Signal: Strong' : 'Signal: Offline'}</span>
                    </div>
                    <Button 
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? 'secondary' : 'primary'}
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
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">WSAPI Nodal Credentials</span>
                                <div className="h-px flex-1 bg-outline-variant/10"></div>
                            </div>
                            <button 
                                onClick={() => window.open('https://wsapi.chat', '_blank')}
                                className="flex items-center gap-2 text-primary hover:underline"
                            >
                                <span className="material-symbols-outlined text-sm">help</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Guide</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Business Phone Number</label>
                                <input 
                                    disabled={!isEditing}
                                    value={config.business_number}
                                    onChange={(e) => setConfig({...config, business_number: e.target.value})}
                                    placeholder="+1234567890" 
                                    className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-40" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">WSAPI Instance ID</label>
                                <input 
                                    disabled={!isEditing}
                                    value={config.instance_id}
                                    onChange={(e) => setConfig({...config, instance_id: e.target.value})}
                                    placeholder="instance_xxx..." 
                                    className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-40" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Subscription ID</label>
                                <input 
                                    disabled={!isEditing}
                                    value={config.subscription_id || ''}
                                    onChange={(e) => setConfig({...config, subscription_id: e.target.value})}
                                    placeholder="sub_xxxx..." 
                                    className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-40" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">WSAPI API Key</label>
                                <div className="relative">
                                    <input 
                                        disabled={!isEditing}
                                        type="password"
                                        value={config.api_key}
                                        onChange={(e) => setConfig({...config, api_key: e.target.value})}
                                        placeholder="YOUR_WSAPI_KEY" 
                                        className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-40 pr-14" 
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30">vpn_key</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[8px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest mt-2 px-1 italic">
                            * Use test key <span className="text-primary font-black select-all">TEST_CONNECT_2026</span> to bypass live verification.
                        </p>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Automated Welcome Sequence</label>
                            <textarea 
                                disabled={!isEditing}
                                value={config.welcome_message}
                                onChange={(e) => setConfig({...config, welcome_message: e.target.value})}
                                rows={4}
                                className="w-full p-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-bold text-sm text-on-surface leading-relaxed disabled:opacity-40 resize-none" 
                            />
                        </div>

                        {isEditing && (
                            <Button 
                                onClick={handleSave}
                                disabled={mutation.isPending}
                                className="w-full h-16 bg-[#1a1c1d] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary transition-all border-none shadow-xl mt-4 relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {mutation.isPending && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                                    {mutation.isPending ? 'Verifying with Meta...' : 'Verify & Sync Connection'}
                                </div>
                                {mutation.isPending && <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>}
                            </Button>
                        )}

                        {!isEditing && config.status === 'connected' && (
                            <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-outline-variant/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-50">Webhook Destination</span>
                                    <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[7px] font-black uppercase">Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <code className="flex-1 bg-white p-3 rounded-xl border border-outline-variant/5 text-[10px] font-bold text-primary truncate">
                                        {window.location.origin}/api/whatsapp/webhook
                                    </code>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook`);
                                            success('Webhook URL copied to clipboard.');
                                        }}
                                        className="w-10 h-10 bg-white rounded-xl border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                                <p className="text-[8px] font-bold text-on-surface-variant/40 leading-relaxed uppercase">
                                    * If testing on <span className="text-primary font-black">localhost</span>, you MUST use <span className="text-primary font-black underline">Ngrok</span> to make this URL public.
                                </p>
                            </div>
                        )}
                    </Card>

                    <Card className="p-10 rounded-[2.5rem] bg-emerald-50 border border-emerald-100/50 shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                                <span className="material-symbols-outlined">qr_code_2</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight italic font-headline">Initialization QR</h4>
                                <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest">Deploy this QR in your physical restaurant node.</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-10 py-4">
                            <div className="w-40 h-40 bg-white p-4 rounded-3xl shadow-inner flex items-center justify-center border border-emerald-100">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/${config.business_number.replace('+', '')}`} alt="WhatsApp QR" className="w-full h-full object-contain opacity-80" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <p className="text-[11px] font-bold text-emerald-900/70 leading-relaxed uppercase tracking-wide">
                                    When customers scan this code, their neural link will initialize an autonomous chat sequence with your business agent.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-white px-3 py-1.5 rounded-lg border border-emerald-100 text-[8px] font-black uppercase text-emerald-600 tracking-widest">Self-Service Menu</span>
                                    <span className="bg-white px-3 py-1.5 rounded-lg border border-emerald-100 text-[8px] font-black uppercase text-emerald-600 tracking-widest">Real-time Tracking</span>
                                    <span className="bg-white px-3 py-1.5 rounded-lg border border-emerald-100 text-[8px] font-black uppercase text-emerald-600 tracking-widest">Automated KOT</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Nodal Simulator for Testing */}
                    <Card className="p-10 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl space-y-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Nodal Simulator</h4>
                            </div>
                            <p className="text-white/50 text-[11px] uppercase font-bold tracking-tight mb-8 leading-relaxed">
                                Use this portal to simulate incoming signals from the global WSAPI grid.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <Button 
                                    onClick={async () => {
                                        if (!config.instance_id) {
                                            toastError('Please save your Instance ID first!');
                                            return;
                                        }
                                        await api.post('/whatsapp/webhook', {
                                            event: 'messages.received',
                                            instanceId: config.instance_id,
                                            data: { 
                                                key: { remoteJid: '919876543210@c.us' },
                                                message: { conversation: 'hi' }
                                            }
                                        });
                                        success('Simulated WSAPI "HI" processed.');
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest"
                                >
                                    Simulate "HI"
                                </Button>
                                <Button 
                                    onClick={async () => {
                                        if (!config.instance_id) {
                                            toastError('Please save your Instance ID first!');
                                            return;
                                        }
                                        await api.post('/whatsapp/webhook', {
                                            event: 'messages.received',
                                            instanceId: config.instance_id,
                                            data: { 
                                                key: { remoteJid: '919876543210@c.us' },
                                                message: { conversation: '1' }
                                            }
                                        });
                                        success('Simulated WSAPI "MENU" request.');
                                    }}
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest"
                                >
                                    Simulate "1" (Menu)
                                </Button>
                            </div>
                            <div className="pt-4">
                                <div className="flex gap-2">
                                    <input 
                                        id="sim_order_id"
                                        placeholder="Enter Dish ID (e.g. 5)"
                                        className="flex-1 h-14 px-6 bg-white/5 border border-white/10 rounded-2xl outline-none text-white font-bold text-xs"
                                    />
                                    <Button 
                                        onClick={async () => {
                                            const id = (document.getElementById('sim_order_id') as HTMLInputElement).value;
                                            
                                            if (!config.instance_id) {
                                                toastError('Please save your Instance ID first!');
                                                return;
                                            }

                                            await api.post('/whatsapp/webhook', {
                                                event: 'messages.received',
                                                instanceId: config.instance_id,
                                                data: { 
                                                    key: { remoteJid: '919876543210@c.us' },
                                                    message: { conversation: `order ${id}` }
                                                }
                                            });
                                            success(`Simulated WSAPI Order for ID ${id}.`);
                                        }}
                                        className="bg-primary text-white h-14 px-8 rounded-2xl text-[9px] font-black uppercase tracking-widest"
                                    >
                                        Simulate Order
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-[-5%] bottom-[-5%] opacity-[0.05] text-[10rem] text-primary rotate-12 select-none">
                            <span className="material-symbols-outlined">terminal</span>
                        </div>
                    </Card>
                </div>

                {/* Secondary Sidebar */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-[2rem] bg-[#1a1c1d] text-white border-none shadow-xl relative overflow-hidden h-fit">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-6">Real-time Telemetry</p>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Daily Transactions</p>
                                <p className="text-3xl font-black italic tracking-tighter tabular-nums text-white">42</p>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Success Rate</p>
                                <p className="text-3xl font-black italic tracking-tighter tabular-nums text-emerald-400">98.4%</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Nodal Latency</p>
                                <p className="text-3xl font-black italic tracking-tighter tabular-nums text-primary">120ms</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2rem] bg-white border border-outline-variant/10 shadow-sm space-y-6 h-fit">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mb-2">Protocol Limits</p>
                        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-primary w-[35%]"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">175 / 500 Orders</span>
                            <span className="text-[8px] font-bold text-on-surface-variant opacity-40 italic">Quota resets in 12 days</span>
                        </div>
                    </Card>

                    <div className="p-6 rounded-[2rem] border border-outline-variant/10 border-dashed flex flex-col items-center justify-center text-center opacity-40">
                        <span className="material-symbols-outlined text-4xl mb-2">add_task</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">More Analytics Coming</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
