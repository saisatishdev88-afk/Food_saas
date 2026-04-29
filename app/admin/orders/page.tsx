'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, Order } from '@/api/orders';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function OrdersHistoryPage() {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { success, error } = useToast();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders', filterStatus, filterType],
        queryFn: () => fetchOrders({ status: filterStatus, type: filterType })
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status, payment_status }: { id: number; status: Order['status'], payment_status?: Order['payment_status'] }) => 
            updateOrderStatus(id, { status, payment_status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setSelectedOrder(null);
            success('Order status updated successfully');
        },
        onError: () => {
            error('Failed to update order status');
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'preparing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'delivered': return 'bg-slate-50 text-slate-500 border-slate-100';
            case 'cancelled': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-transparent';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-variant/10 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase text-on-surface leading-none">Order <span className="text-primary">Master</span></h1>
                    <p className="text-on-surface-variant font-medium text-[11px] mt-1.5 opacity-60">Full audit log of all restaurant transactions.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <select 
                        className="h-11 px-4 rounded-xl bg-white border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest shadow-sm focus:border-primary outline-none transition-all"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="">Status: All</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                    </select>
                    <select 
                        className="h-11 px-4 rounded-xl bg-white border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest shadow-sm focus:border-primary outline-none transition-all"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="">Channel: All</option>
                        <option value="offline">POS</option>
                        <option value="online">App</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border border-outline-variant/10 rounded-[1.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                            <th className="px-8 py-5 w-[22%]">Order Information</th>
                            <th className="px-8 py-5 w-[15%]">Type</th>
                            <th className="px-8 py-5 w-[15%]">Commercial</th>
                            <th className="px-8 py-5 w-[10%]">QTY</th>
                            <th className="px-8 py-5 w-[15%]">Status</th>
                            <th className="px-8 py-5 w-[15%]">Date & Time</th>
                            <th className="px-8 py-5 w-[8%] text-right">Ops</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-8 py-20 text-center font-bold uppercase tracking-widest text-[10px] opacity-20">Loading master ledger...</td>
                            </tr>
                        ) : orders?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-8 py-20 text-center font-bold uppercase tracking-widest text-[9px] opacity-20">No transactions recorded.</td>
                            </tr>
                        ) : orders?.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-outline-variant/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-on-surface text-[15px] tracking-tight truncate leading-none">#{order.order_number}</p>
                                            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40 mt-1 truncate">{order.type}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-md border flex items-center gap-1.5 w-fit ${
                                            order.fulfillment_type === 'dine_in' ? 'bg-primary/5 text-primary border-primary/20' : 
                                            order.fulfillment_type === 'takeaway' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                            'bg-indigo-50 text-indigo-600 border-indigo-200'
                                        }`}>
                                            <span className="material-symbols-outlined text-[12px]">
                                                {order.fulfillment_type === 'dine_in' ? 'table_restaurant' : 
                                                 order.fulfillment_type === 'takeaway' ? 'shopping_bag' : 'delivery_dining'}
                                            </span>
                                            {order.fulfillment_type.replace('_', ' ')} {order.table_number ? `• T-${order.table_number}` : ''}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-on-surface text-base tracking-tight tabular-nums leading-none">₹{Number(order.total_amount).toFixed(2)}</span>
                                        <span className={`text-[9px] font-bold uppercase mt-1 tracking-wider ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{order.payment_status}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="font-bold text-sm text-on-surface tabular-nums">{order.items?.length || 0}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight whitespace-nowrap">{formatDate(order.created_at)}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button 
                                        onClick={() => setSelectedOrder(order)}
                                        className="w-8 h-8 rounded-lg bg-white text-slate-300 hover:bg-[#1a1c1d] hover:text-white transition-all border border-outline-variant/10 shadow-sm flex items-center justify-center ml-auto"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 w-full max-w-2xl shadow-2xl scale-in-center overflow-hidden border border-outline-variant/10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-tight text-on-surface">Order Details <span className="text-primary font-normal ml-2">#{selectedOrder.order_number}</span></h2>
                                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">Transaction Record Audit</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-on-surface transition-all">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Items Section */}
                            <div>
                                <h3 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 opacity-40">Items Breakdown</h3>
                                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl h-80 overflow-y-auto custom-scrollbar border border-outline-variant/5">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start py-3 border-b border-outline-variant/5 last:border-0">
                                            <div className="flex items-start gap-3">
                                                <span className="text-primary font-bold text-xs tabular-nums">{item.quantity}×</span>
                                                <div>
                                                    <span className="font-bold text-[12px] uppercase tracking-tight text-on-surface block leading-none">{item.item_name}</span>
                                                    <span className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest mt-1 block">₹{Number(item.price).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-on-surface text-xs tabular-nums">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lifecycle & Actions */}
                            <div className="flex flex-col">
                                <h3 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 opacity-40">Status Control</h3>
                                <div className="bg-white border border-outline-variant/10 p-8 rounded-2xl flex-1 flex flex-col justify-between shadow-sm">
                                    <div className="mb-8">
                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-50">
                                            <span>Current Stage</span>
                                            <span className="text-primary">{selectedOrder.status.toUpperCase()}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden flex gap-0.5">
                                            {['pending', 'accepted', 'preparing', 'ready', 'delivered'].map((s, i) => (
                                                <div key={i} className={cn(
                                                    "h-full flex-1 transition-all duration-700",
                                                    ['pending', 'accepted', 'preparing', 'ready', 'delivered'].indexOf(selectedOrder.status) >= i ? 'bg-primary' : 'bg-slate-100'
                                                )}></div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedOrder.status !== 'delivered' && (
                                            <Button 
                                                variant="default"
                                                className="w-full h-12 rounded-xl bg-[#1a1c1d] text-white font-bold uppercase tracking-widest text-[9px] shadow-lg"
                                                onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: 'delivered', payment_status: 'paid' })}
                                            >Mark as Delivered</Button>
                                        )}
                                        <Button 
                                            variant="secondary"
                                            className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] text-red-500 hover:bg-red-50 border-outline-variant/10"
                                            onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: 'cancelled' })}
                                        >Cancel Order</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function cn(...args: any[]) {
    return args.filter(Boolean).join(' ');
}
