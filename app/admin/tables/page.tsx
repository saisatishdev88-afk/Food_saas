'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface RestaurantTable {
    id: number;
    table_number: string;
    status: 'available' | 'occupied';
}

export default function TableManagerPage() {
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();
    const [newTableNumber, setNewTableNumber] = useState('');

    const { data: tables, isLoading } = useQuery({
        queryKey: ['tables'],
        queryFn: () => api.get('/tenant/tables').then(res => res.data)
    });

    const addTableMutation = useMutation({
        mutationFn: (table_number: string) => api.post('/tenant/tables', { table_number }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            setNewTableNumber('');
            success('Table added successfully');
        },
        onError: (err: any) => {
            toastError(err.response?.data?.message || 'Failed to add table');
        }
    });

    const releaseTableMutation = useMutation({
        mutationFn: (id: number) => api.post(`/tenant/tables/${id}/release`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            success('Table released and is now available');
        },
        onError: (err: any) => {
            toastError(err.response?.data?.message || 'Failed to release table');
        }
    });

    const handleAddTable = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTableNumber) {
            addTableMutation.mutate(newTableNumber);
        }
    };

    return (
        <div className="p-8 lg:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#1a1c1d] leading-none mb-2">Table Manager</h2>
                    <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Control QR session locking and table occupancy</p>
                </div>
                
                <form onSubmit={handleAddTable} className="flex items-center gap-2 bg-white p-2 rounded-3xl shadow-sm border border-outline-variant/10">
                    <input 
                        type="text" 
                        placeholder="Table Number (e.g. T-12)"
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 outline-none px-4 text-xs font-bold w-48"
                    />
                    <Button type="submit" disabled={addTableMutation.isPending} className="rounded-2xl bg-primary text-white text-[9px] font-black uppercase tracking-widest h-12 px-6">
                        Add Node
                    </Button>
                </form>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {isLoading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-surface-container rounded-[2.5rem] animate-pulse"></div>
                    ))
                ) : tables?.length > 0 ? (
                    tables.map((table: RestaurantTable) => (
                        <div key={table.id} className={`aspect-square rounded-[3rem] p-6 flex flex-col items-center justify-center gap-4 transition-all duration-500 relative group border ${
                            table.status === 'occupied' 
                            ? 'bg-red-50 border-red-200 shadow-xl shadow-red-500/5' 
                            : 'bg-white border-outline-variant/10 hover:shadow-2xl hover:-translate-y-2'
                        }`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                table.status === 'occupied' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-on-surface/20'
                            }`}>
                                <span className="material-symbols-outlined text-3xl">
                                    {table.status === 'occupied' ? 'lock_person' : 'table_restaurant'}
                                </span>
                            </div>
                            <div className="text-center">
                                <h3 className="font-black text-xl uppercase tracking-tighter leading-none mb-1">{table.table_number}</h3>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${table.status === 'occupied' ? 'text-red-500' : 'text-on-surface-variant opacity-30'}`}>
                                    {table.status === 'occupied' ? 'Occupied' : 'Available'}
                                </p>
                            </div>

                            {table.status === 'occupied' && (
                                <button 
                                    onClick={() => releaseTableMutation.mutate(table.id)}
                                    className="absolute inset-0 bg-red-600/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 rounded-[3rem] transition-all flex flex-col items-center justify-center gap-2 text-white"
                                >
                                    <span className="material-symbols-outlined text-3xl">lock_open</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Release Table</span>
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
                        <span className="material-symbols-outlined text-8xl mb-4">table_bar</span>
                        <p className="font-black uppercase tracking-widest text-sm">No tables initialized in this node</p>
                    </div>
                )}
            </div>

            {/* Legend / Status Info */}
            <div className="bg-[#1a1c1d] rounded-[3rem] p-10 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] -mr-48 -mt-48"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Locked State</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">When a customer scans and places an order, the table is automatically locked. No other orders can be placed from this QR until released.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Manual Release</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">Waiters or Admins must manually release tables after cleaning/checkout to allow new customers to scan the QR.</p>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="text-right">
                            <p className="text-4xl font-black italic text-primary leading-none mb-1">PRO</p>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Session Shield Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
