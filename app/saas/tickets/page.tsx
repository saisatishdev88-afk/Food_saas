'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

type Ticket = {
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'resolved';
    created_at: string;
    tenant?: { name: string };
    user?: { name: string };
    comments?: any[];
};

export default function SaasTicketsPage() {
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [commentMessage, setCommentMessage] = useState('');
    const queryClient = useQueryClient();
    const { success, error } = useToast();

    // Fetch All Tickets (SuperAdmin)
    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['saas-tickets'],
        queryFn: async () => {
            const res = await api.get('/saas/tickets');
            return res.data;
        }
    });

    // Fetch Single Ticket Details
    const { data: activeTicket, isLoading: isActiveLoading } = useQuery({
        queryKey: ['saas-ticket', selectedTicketId],
        queryFn: async () => {
            if (!selectedTicketId) return null;
            const res = await api.get(`/saas/tickets/${selectedTicketId}`);
            return res.data;
        },
        enabled: !!selectedTicketId
    });

    // Update Status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            const res = await api.put(`/saas/tickets/${selectedTicketId}/status`, { status });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saas-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['saas-ticket', selectedTicketId] });
            success('Ticket status updated.');
        }
    });

    // Add Comment Mutation
    const commentMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await api.post(`/saas/tickets/${selectedTicketId}/comments`, { message });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saas-ticket', selectedTicketId] });
            setCommentMessage('');
        }
    });

    const priorityColors = {
        low: 'bg-blue-50 text-blue-700 ring-blue-100',
        medium: 'bg-amber-50 text-amber-700 ring-amber-100',
        high: 'bg-red-50 text-red-700 ring-red-100'
    };

    const statusColors = {
        open: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        in_progress: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        resolved: 'bg-slate-50 text-slate-500 ring-slate-100'
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header>
                <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic">Network Support <span className="text-primary italic">Console</span></h2>
                <p className="text-on-surface-variant font-medium text-sm opacity-50">Manage incoming requests and technical issues from all restaurant nodes.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Tickets Master List */}
                <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <p className="text-center py-20 opacity-20 font-black uppercase tracking-widest text-xs">Polling network tickets...</p>
                    ) : tickets.length === 0 ? (
                        <p className="text-center py-20 opacity-20 italic">No tickets in the system.</p>
                    ) : tickets.map((ticket: Ticket) => (
                        <Card 
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`p-6 cursor-pointer border transition-all ${selectedTicketId === ticket.id ? 'border-primary ring-1 ring-primary shadow-lg bg-slate-50/50' : 'border-outline-variant/5 hover:border-primary/30 bg-white'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none italic">{ticket.tenant?.name}</span>
                                    <h3 className="font-headline font-black text-on-surface tracking-tight uppercase italic">{ticket.title}</h3>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ring-1 ring-inset ${priorityColors[ticket.priority]}`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-6">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ${statusColors[ticket.status]}`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                                <span className="text-[9px] font-bold text-on-surface-variant opacity-30">
                                    {new Date(ticket.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Ticket Workspace */}
                <div className="lg:col-span-7 h-[750px]">
                    {selectedTicketId ? (
                        <Card className="h-full flex flex-col border-outline-variant/10 shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                            {isActiveLoading ? (
                                <div className="flex-1 flex items-center justify-center italic opacity-30 animate-pulse font-black uppercase tracking-widest text-xs">Opening ticket workspace...</div>
                            ) : activeTicket && (
                                <>
                                    <div className="p-10 border-b border-outline-variant/5 bg-slate-50/80">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic">Ticket #{activeTicket.id} • {activeTicket.tenant?.name}</p>
                                                <h2 className="text-3xl font-black font-headline text-on-surface uppercase italic tracking-tighter">{activeTicket.title}</h2>
                                                <p className="text-[10px] font-bold text-on-surface-variant opacity-50 mt-1 uppercase tracking-widest">Opened by {activeTicket.user?.name} on {new Date(activeTicket.created_at).toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="flex gap-2">
                                                    {['open', 'in_progress', 'resolved'].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => updateStatusMutation.mutate(s)}
                                                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                                                activeTicket.status === s 
                                                                ? 'bg-[#1a1c1d] text-white shadow-md' 
                                                                : 'bg-white text-on-surface-variant border border-outline-variant/10 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            {s.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ${priorityColors[activeTicket.priority]}`}>
                                                    Priority: {activeTicket.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-white/50 rounded-3xl border border-outline-variant/5 text-sm text-on-surface-variant font-medium leading-relaxed shadow-sm">
                                            {activeTicket.description}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-white custom-scrollbar flex flex-col-reverse">
                                        <div className="space-y-8 flex flex-col">
                                            {activeTicket.comments?.length === 0 ? (
                                                <div className="py-20 flex flex-col items-center justify-center opacity-10 gap-6">
                                                    <span className="material-symbols-outlined text-7xl">support_agent</span>
                                                    <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting first response</p>
                                                </div>
                                            ) : activeTicket.comments?.map((comment: any) => {
                                                const isSuper = comment.user?.role === 'superadmin' || comment.user?.name === 'Foodsoul Admin'; // Simplified
                                                // Actually let's use the ID or role if available. 
                                                // For now, let's assume SuperAdmin is NOT the ticket owner.
                                                const isSuperAdminUser = comment.user_id !== activeTicket.user_id;

                                                return (
                                                    <div key={comment.id} className={`flex flex-col ${isSuperAdminUser ? 'items-end' : 'items-start'}`}>
                                                        <div className={`p-5 rounded-[2rem] max-w-[80%] text-sm font-medium leading-relaxed shadow-sm ${
                                                            isSuperAdminUser ? 'bg-[#1a1c1d] text-white rounded-tr-none' : 'bg-slate-100 text-on-surface rounded-tl-none'
                                                        }`}>
                                                            {comment.message}
                                                        </div>
                                                        <div className={`flex items-center gap-2 mt-3 px-2 ${isSuperAdminUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden border border-white">
                                                                <img src={`https://ui-avatars.com/api/?name=${comment.user?.name}&background=333&color=fff`} className="w-full h-full" alt="avatar"/>
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-30">
                                                                {comment.user?.name} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 border-t border-outline-variant/5">
                                        <div className="flex gap-6">
                                            <div className="flex-1 relative">
                                                <input 
                                                    type="text" 
                                                    value={commentMessage}
                                                    onChange={(e) => setCommentMessage(e.target.value)}
                                                    placeholder="Communicate with restaurant owner..."
                                                    className="w-full bg-white border border-outline-variant/10 rounded-full px-8 py-4 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-inner font-medium"
                                                    onKeyPress={(e) => e.key === 'Enter' && commentMutation.mutate(commentMessage)}
                                                />
                                            </div>
                                            <Button 
                                                onClick={() => commentMutation.mutate(commentMessage)}
                                                disabled={!commentMessage.trim() || commentMutation.isPending}
                                                className="h-14 px-10 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">reply</span>
                                                {commentMutation.isPending ? 'Sending...' : 'Send Reply'}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/10 rounded-[3rem] bg-slate-50/20 opacity-20 gap-8 grayscale">
                            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-5xl">inbox</span>
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.5em]">Select a network ticket to begin resolution</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
