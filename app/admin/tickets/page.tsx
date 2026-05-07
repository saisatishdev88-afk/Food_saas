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
    comments_count?: number;
};

export default function TenantTicketsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'medium' });
    const [commentMessage, setCommentMessage] = useState('');
    const queryClient = useQueryClient();
    const { success, error } = useToast();

    // Fetch Tickets
    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['tenant-tickets'],
        queryFn: async () => {
            const res = await api.get('/tenant/tickets');
            return res.data;
        }
    });

    // Fetch Single Ticket Details (for chat)
    const { data: activeTicket, isLoading: isActiveLoading } = useQuery({
        queryKey: ['ticket', selectedTicketId],
        queryFn: async () => {
            if (!selectedTicketId) return null;
            const res = await api.get(`/tenant/tickets/${selectedTicketId}`);
            return res.data;
        },
        enabled: !!selectedTicketId
    });

    // Create Ticket Mutation
    const createMutation = useMutation({
        mutationFn: async (data: typeof newTicket) => {
            const res = await api.post('/tenant/tickets', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-tickets'] });
            setIsCreateModalOpen(false);
            setNewTicket({ title: '', description: '', priority: 'medium' });
            success('Support ticket raised successfully.');
        },
        onError: () => error('Failed to raise ticket.')
    });

    // Add Comment Mutation
    const commentMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await api.post(`/tenant/tickets/${selectedTicketId}/comments`, { message });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', selectedTicketId] });
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
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto w-full space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/5 pb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic">Support <span className="text-primary italic">Tickets</span></h2>
                    <p className="text-on-surface-variant font-medium text-sm opacity-50">Report issues or request assistance from platform administrators.</p>
                </div>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-white px-8 h-12 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                >
                    Raise New Ticket
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Tickets List */}
                <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <p className="text-center py-20 opacity-20 font-black uppercase tracking-widest text-xs">Loading tickets...</p>
                    ) : tickets.length === 0 ? (
                        <p className="text-center py-20 opacity-20 italic">No tickets raised yet.</p>
                    ) : tickets.map((ticket: Ticket) => (
                        <Card 
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`p-6 cursor-pointer border transition-all ${selectedTicketId === ticket.id ? 'border-primary ring-1 ring-primary shadow-md' : 'border-outline-variant/5 hover:border-primary/30'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ${priorityColors[ticket.priority]}`}>
                                    {ticket.priority} Priority
                                </span>
                                <span className="text-[9px] font-bold text-on-surface-variant opacity-40">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-headline font-black text-on-surface tracking-tight mb-2 uppercase italic">{ticket.title}</h3>
                            <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 font-medium opacity-70">{ticket.description}</p>
                            <div className="flex justify-between items-center border-t border-outline-variant/5 pt-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ${statusColors[ticket.status]}`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-1.5 opacity-40">
                                    <span className="material-symbols-outlined text-sm">forum</span>
                                    <span className="text-[10px] font-black">CHAT</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Ticket Details & Chat */}
                <div className="lg:col-span-7 h-[700px]">
                    {selectedTicketId ? (
                        <Card className="h-full flex flex-col border-outline-variant/10 shadow-xl rounded-[2.5rem] overflow-hidden">
                            {isActiveLoading ? (
                                <div className="flex-1 flex items-center justify-center italic opacity-30">Loading discussion...</div>
                            ) : activeTicket && (
                                <>
                                    <div className="p-8 border-b border-outline-variant/5 bg-slate-50/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-2xl font-black font-headline text-on-surface uppercase italic tracking-tighter">{activeTicket.title}</h2>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${statusColors[activeTicket.status]}`}>
                                                {activeTicket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-on-surface-variant font-medium opacity-80 leading-relaxed whitespace-pre-wrap">
                                            {activeTicket.description}
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white custom-scrollbar">
                                        {activeTicket.comments?.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                                                <span className="material-symbols-outlined text-5xl">chat_bubble</span>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No discussion yet</p>
                                            </div>
                                        ) : activeTicket.comments?.map((comment: any) => {
                                            const isMe = comment.user_id === activeTicket.user_id;
                                            return (
                                                <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed ${
                                                        isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-on-surface rounded-tl-none'
                                                    }`}>
                                                        {comment.message}
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-2 mx-1">
                                                        {comment.user?.name} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="p-6 bg-slate-50 border-t border-outline-variant/5">
                                        <div className="flex gap-4">
                                            <input 
                                                type="text" 
                                                value={commentMessage}
                                                onChange={(e) => setCommentMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 bg-white border border-outline-variant/10 rounded-full px-6 py-3 text-sm focus:border-primary outline-none transition-all shadow-sm"
                                                onKeyPress={(e) => e.key === 'Enter' && commentMutation.mutate(commentMessage)}
                                            />
                                            <Button 
                                                onClick={() => commentMutation.mutate(commentMessage)}
                                                disabled={!commentMessage.trim() || commentMutation.isPending}
                                                className="w-12 h-12 rounded-full bg-[#1a1c1d] text-white p-0 flex items-center justify-center hover:bg-primary transition-all active:scale-95 shadow-lg"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/10 rounded-[2.5rem] bg-slate-50/30 opacity-30 gap-6">
                            <span className="material-symbols-outlined text-6xl">confirmation_number</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select a ticket to view discussion</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg bg-white p-8 rounded-[2rem] shadow-2xl relative">
                        <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-6 right-6 opacity-30 hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="text-2xl font-black font-headline uppercase italic mb-8 tracking-tight">Raise Support <span className="text-primary italic">Request</span></h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant block mb-2 ml-1">Subject / Issue Title</label>
                                <input 
                                    className="w-full bg-slate-50 border border-outline-variant/10 rounded-xl px-5 py-3 outline-none focus:border-primary font-bold text-sm transition-all shadow-sm" 
                                    placeholder="e.g. Printer connectivity issue"
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant block mb-2 ml-1">Priority Level</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['low', 'medium', 'high'].map(p => (
                                        <button 
                                            key={p}
                                            onClick={() => setNewTicket({...newTicket, priority: p as any})}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                newTicket.priority === p ? 'bg-[#1a1c1d] text-white border-transparent shadow-lg' : 'bg-white text-on-surface-variant border-outline-variant/10 hover:bg-slate-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant block mb-2 ml-1">Description</label>
                                <textarea 
                                    rows={4}
                                    className="w-full bg-slate-50 border border-outline-variant/10 rounded-xl px-5 py-3 outline-none focus:border-primary font-bold text-sm transition-all shadow-sm resize-none" 
                                    placeholder="Please describe the issue in detail..."
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                />
                            </div>

                            <Button 
                                onClick={() => createMutation.mutate(newTicket)}
                                disabled={!newTicket.title || !newTicket.description || createMutation.isPending}
                                className="w-full bg-primary text-white h-14 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                {createMutation.isPending ? 'Submitting Request...' : 'Submit Support Ticket'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
