'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Session {
    id: number;
    device: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    created_at: string;
}

export default function DeviceManagementPage() {
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: sessionData, isLoading } = useQuery({
        queryKey: ['active-sessions'],
        queryFn: () => api.get('/saas/sessions').then(res => res.data.sessions)
    });

    const logoutMutation = useMutation({
        mutationFn: (tokenId: number) => api.delete(`/saas/sessions/${tokenId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
            success('Session terminated successfully');
        },
        onError: (err: any) => {
            toastError(err.response?.data?.message || 'Failed to terminate session');
        }
    });

    const logoutAllMutation = useMutation({
        mutationFn: () => api.delete('/saas/sessions-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
            success('All other sessions terminated');
        }
    });

    const handleLogout = (id: number) => {
        if (confirm('Are you sure you want to log out from this device?')) {
            logoutMutation.mutate(id);
        }
    };

    const handleLogoutAll = () => {
        if (confirm('This will log you out from all other devices. Continue?')) {
            logoutAllMutation.mutate();
        }
    };

    const sessions = sessionData || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tight text-on-surface">Device Management</h2>
                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.2em] opacity-40">Manage your active sessions and connected hardware</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Active Limit</p>
                        <p className="text-xl font-black italic">{sessions.length}<span className="text-on-surface/20">/2</span></p>
                    </div>
                    <Button 
                        onClick={handleLogoutAll}
                        variant="outline" 
                        className="h-12 border-error/20 text-error hover:bg-error/5 text-[10px] font-black uppercase tracking-widest"
                    >
                        Logout All Devices
                    </Button>
                </div>
            </div>

            {/* Device Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    [1, 2].map(i => (
                        <div key={i} className="h-48 bg-surface-container rounded-[2rem] animate-pulse"></div>
                    ))
                ) : sessions.length > 0 ? (
                    sessions.map((session: Session) => (
                        <div key={session.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-3xl">
                                            {session.user_agent?.toLowerCase().includes('mobile') ? 'smartphone' : 'laptop_mac'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg uppercase italic tracking-tight">{session.ip_address}</h3>
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 line-clamp-1 max-w-[200px]">
                                            {session.user_agent || 'Unknown Device Metadata'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active Now</span>
                                    <p className="text-[10px] font-bold text-on-surface-variant mt-2 uppercase opacity-40">Last activity: {session.last_activity}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-1">Session Started</span>
                                    <span className="text-xs font-bold">{new Date(session.created_at).toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => handleLogout(session.id)}
                                    className="h-12 px-6 rounded-2xl bg-error/5 text-error hover:bg-error hover:text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">logout</span>
                                    Revoke Session
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-on-surface/10 mb-4">devices_off</span>
                        <p className="text-on-surface-variant font-bold uppercase tracking-widest">No active sessions found</p>
                    </div>
                )}
            </div>

            {/* Security Tip */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">security</span>
                    </div>
                    <div>
                        <h4 className="text-xl font-black uppercase italic leading-none mb-1">Security Enforcement</h4>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">To maintain network integrity, a maximum of 2 devices are allowed per node.</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Status</p>
                    <p className="text-sm font-bold uppercase">All nodes secured</p>
                </div>
            </div>
        </div>
    );
}
