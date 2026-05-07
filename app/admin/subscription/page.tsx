'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export default function SubscriptionManagementPage() {
    const queryClient = useQueryClient();
    const { success, error } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: subscriptionData, isLoading } = useQuery({
        queryKey: ['subscription-plans'],
        queryFn: async () => {
            const res = await api.get('/tenant/subscription/plans');
            return res.data;
        }
    });

    const renewMutation = useMutation({
        mutationFn: async () => {
            setIsProcessing(true);
            const res = await api.post('/tenant/subscription/renew');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-dashboard'] });
            success('Subscription renewed successfully!');
            setIsProcessing(false);
        },
        onError: () => {
            error('Failed to renew subscription.');
            setIsProcessing(false);
        }
    });

    const upgradeMutation = useMutation({
        mutationFn: async (planType: string) => {
            setIsProcessing(true);
            const res = await api.post('/tenant/subscription/upgrade', { plan_type: planType });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-dashboard'] });
            success('Plan upgraded successfully!');
            setIsProcessing(false);
        },
        onError: () => {
            error('Failed to upgrade plan.');
            setIsProcessing(false);
        }
    });

    if (isLoading) return <div className="p-12 text-center italic opacity-30 font-black uppercase tracking-widest text-xs">Accessing subscription registry...</div>;

    const currentPlan = subscriptionData?.current_plan;
    const isExpired = subscriptionData?.is_expired;

    return (
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto w-full space-y-12 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/5 pb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic">Subscription <span className="text-primary italic">Management</span></h2>
                    <p className="text-on-surface-variant font-medium text-sm opacity-50">Manage your restaurant node's commercial tier and network access.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {subscriptionData?.plans.map((plan: any) => {
                    const isCurrent = plan.id === currentPlan;
                    const canUpgrade = !isCurrent && (
                        (currentPlan === 'basic') || 
                        (currentPlan === 'premium' && plan.id === 'pro')
                    );

                    return (
                        <Card key={plan.id} className={`p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden transition-all duration-500 ${isCurrent ? 'ring-4 ring-primary shadow-2xl scale-105 z-10' : 'border-outline-variant/10 shadow-sm opacity-90'}`}>
                            {isCurrent && (
                                <div className="absolute top-6 right-8 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg">Current Active</div>
                            )}
                            
                            <div className="mb-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mb-2">{plan.name}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black font-headline italic tracking-tighter text-on-surface">₹{plan.price.toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">/ Month</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        <span className="text-xs font-bold text-on-surface uppercase tracking-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-outline-variant/5">
                                {isExpired ? (
                                    <>
                                        {isCurrent ? (
                                            <Button 
                                                onClick={() => renewMutation.mutate()}
                                                disabled={isProcessing}
                                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all bg-red-600 text-white animate-pulse"
                                            >
                                                {isProcessing ? 'Processing...' : 'Renew Expired Plan'}
                                            </Button>
                                        ) : (
                                            <Button 
                                                onClick={() => upgradeMutation.mutate(plan.id)}
                                                disabled={isProcessing || !canUpgrade}
                                                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none shadow-lg transition-all ${canUpgrade ? 'bg-primary text-white hover:scale-105 active:scale-95' : 'bg-slate-100 text-on-surface-variant opacity-30 cursor-not-allowed'}`}
                                            >
                                                {isProcessing ? 'Processing...' : canUpgrade ? `Upgrade to ${plan.id}` : 'Limited Tier'}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-4 text-center">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-50 px-4 py-2 rounded-lg">Network Access Active</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {isExpired && (
                <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined text-3xl">timer_off</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black font-headline uppercase italic text-red-900 tracking-tight leading-none mb-1">Access Restored by Grace Period</h3>
                            <p className="text-xs font-bold text-red-700/70 uppercase tracking-widest leading-relaxed">Your subscription has expired, but network access is temporarily active for 3 more days. Please renew to avoid node suspension.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
