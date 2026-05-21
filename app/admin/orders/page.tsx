'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, Order } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

// ─── Status helpers ───────────────────────────────────────────────────────────

const FOOD_STATUS: Record<string, { label: string; icon: string; cls: string }> = {
    pending:   { label: 'Pending',    icon: 'schedule',       cls: 'bg-amber-50  text-amber-600  border-amber-200'  },
    accepted:  { label: 'Accepted',   icon: 'thumb_up',       cls: 'bg-blue-50   text-blue-600   border-blue-200'   },
    preparing: { label: 'Preparing',  icon: 'soup_kitchen',   cls: 'bg-violet-50 text-violet-600 border-violet-200' },
    ready:     { label: 'Ready',      icon: 'done_all',       cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    delivered: { label: 'Delivered',  icon: 'check_circle',   cls: 'bg-slate-100 text-slate-500  border-slate-200'  },
    cancelled: { label: 'Cancelled',  icon: 'cancel',         cls: 'bg-red-50    text-red-500    border-red-200'    },
};

const PAYMENT_STATUS: Record<string, { label: string; icon: string; cls: string }> = {
    paid:    { label: 'Paid',    icon: 'check_circle', cls: 'text-emerald-600' },
    pending: { label: 'Pending', icon: 'hourglass_top', cls: 'text-amber-500'  },
    failed:  { label: 'Failed',  icon: 'cancel',        cls: 'text-red-500'    },
    refunded:{ label: 'Refunded',icon: 'replay',        cls: 'text-indigo-500' },
};

const PAYMENT_METHOD: Record<string, { label: string; icon: string }> = {
    Cash:    { label: 'Cash',    icon: 'payments'        },
    QR:      { label: 'UPI QR',  icon: 'qr_code_2'      },
    Razorpay:{ label: 'Razorpay',icon: 'account_balance' },
    razorpay:{ label: 'Razorpay',icon: 'account_balance' },
    cash:    { label: 'Cash',    icon: 'payments'        },
    qr:      { label: 'UPI QR',  icon: 'qr_code_2'      },
};

const FULFILLMENT: Record<string, { label: string; icon: string; cls: string }> = {
    dine_in:  { label: 'Dine In',  icon: 'table_restaurant', cls: 'bg-primary/8 text-primary border-primary/20'     },
    takeaway: { label: 'Takeaway', icon: 'shopping_bag',      cls: 'bg-amber-50  text-amber-700  border-amber-200'   },
    delivery: { label: 'Delivery', icon: 'delivery_dining',   cls: 'bg-indigo-50 text-indigo-600 border-indigo-200'  },
};

const ORDER_SOURCE: Record<string, { label: string; icon: string }> = {
    offline:  { label: 'POS',      icon: 'point_of_sale'   },
    online:   { label: 'Online',   icon: 'language'        },
    whatsapp: { label: 'WhatsApp', icon: 'chat'            },
};

function FoodStatusTag({ status }: { status: string }) {
    const s = FOOD_STATUS[status] ?? { label: status, icon: 'radio_button_unchecked', cls: 'bg-slate-50 text-slate-400 border-slate-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            {s.label}
        </span>
    );
}

function PaymentTag({ status, method }: { status: string; method?: string }) {
    const ps = PAYMENT_STATUS[status] ?? { label: status, icon: 'help', cls: 'text-slate-400' };
    const pm = method ? (PAYMENT_METHOD[method] ?? { label: method, icon: 'payments' }) : null;
    return (
        <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${ps.cls}`}>
                <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{ps.icon}</span>
                {ps.label}
            </span>
            {pm && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50">
                    <span className="material-symbols-outlined text-[10px]">{pm.icon}</span>
                    {pm.label}
                </span>
            )}
        </div>
    );
}

function FulfillmentTag({ type, table }: { type: string; table?: string | null }) {
    const f = FULFILLMENT[type] ?? { label: type, icon: 'local_dining', cls: 'bg-slate-50 text-slate-500 border-slate-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${f.cls}`}>
            <span className="material-symbols-outlined text-[12px]">{f.icon}</span>
            {f.label}{table ? ` · T${table}` : ''}
        </span>
    );
}

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];

function StatusProgressBar({ status }: { status: string }) {
    const idx = STATUS_STEPS.indexOf(status);
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50">Order Progress</span>
                <FoodStatusTag status={status} />
            </div>
            <div className="flex gap-1 h-1.5">
                {STATUS_STEPS.map((s, i) => (
                    <div
                        key={s}
                        title={FOOD_STATUS[s]?.label ?? s}
                        className={`flex-1 rounded-full transition-all duration-500 ${
                            status === 'cancelled' ? 'bg-red-200' :
                            i <= idx ? 'bg-primary' : 'bg-slate-100'
                        }`}
                    />
                ))}
            </div>
            <div className="flex justify-between">
                {STATUS_STEPS.map((s) => (
                    <span key={s} className="text-[7px] font-bold uppercase text-on-surface-variant opacity-30">{FOOD_STATUS[s]?.label}</span>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
        onError: () => { error('Failed to update order status'); }
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-variant/10 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase text-on-surface leading-none">
                        Order <span className="text-primary">History</span>
                    </h1>
                    <p className="text-on-surface-variant font-medium text-[11px] mt-1.5 opacity-60">Complete log of all restaurant orders and transactions.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <select
                        className="h-11 px-4 rounded-xl bg-white border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest shadow-sm focus:border-primary outline-none transition-all"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        className="h-11 px-4 rounded-xl bg-white border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest shadow-sm focus:border-primary outline-none transition-all"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="">All Channels</option>
                        <option value="offline">POS</option>
                        <option value="online">Online</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-outline-variant/10 rounded-[1.5rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50/70 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                            <th className="px-6 py-4 w-[20%]">Order</th>
                            <th className="px-6 py-4 w-[16%]">Type</th>
                            <th className="px-6 py-4 w-[14%]">Amount</th>
                            <th className="px-6 py-4 w-[14%]">Payment</th>
                            <th className="px-6 py-4 w-[8%] text-center">Items</th>
                            <th className="px-6 py-4 w-[14%]">Food Status</th>
                            <th className="px-6 py-4 w-[10%]">Date</th>
                            <th className="px-6 py-4 w-[4%]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-8 py-20 text-center font-bold uppercase tracking-widest text-[10px] opacity-20">
                                    Loading orders...
                                </td>
                            </tr>
                        ) : !orders?.length ? (
                            <tr>
                                <td colSpan={8} className="px-8 py-20 text-center font-bold uppercase tracking-widest text-[9px] opacity-20">
                                    No orders found.
                                </td>
                            </tr>
                        ) : orders.map(order => {
                            const src = ORDER_SOURCE[order.type] ?? { label: order.type, icon: 'receipt_long' };
                            return (
                                <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">

                                    {/* Order info */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-outline-variant/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                                <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-on-surface text-sm tracking-tight truncate leading-none">#{order.order_number}</p>
                                                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">
                                                    <span className="material-symbols-outlined text-[10px]">{src.icon}</span>
                                                    {src.label}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Fulfillment type */}
                                    <td className="px-6 py-5">
                                        <FulfillmentTag type={order.fulfillment_type} table={order.table_number} />
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-5">
                                        <span className="font-bold text-on-surface text-[15px] tracking-tight tabular-nums leading-none">
                                            ₹{Number(order.total_amount).toFixed(2)}
                                        </span>
                                    </td>

                                    {/* Payment status + method */}
                                    <td className="px-6 py-5">
                                        <PaymentTag status={order.payment_status} method={order.payment_method} />
                                    </td>

                                    {/* Item count */}
                                    <td className="px-6 py-5 text-center">
                                        <span className="font-bold text-sm text-on-surface tabular-nums">{order.items?.length || 0}</span>
                                    </td>

                                    {/* Food status */}
                                    <td className="px-6 py-5">
                                        <FoodStatusTag status={order.status} />
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-5">
                                        <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tight whitespace-nowrap opacity-60">
                                            {formatDate(order.created_at)}
                                        </span>
                                    </td>

                                    {/* View button */}
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="w-8 h-8 rounded-lg bg-slate-700 text-white hover:bg-primary transition-all shadow-sm flex items-center justify-center ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 w-full max-w-2xl shadow-2xl scale-in-center overflow-hidden border border-outline-variant/10">

                        {/* Modal header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-tight text-on-surface">
                                    Order <span className="text-primary font-normal">#{selectedOrder.order_number}</span>
                                </h2>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <FulfillmentTag type={selectedOrder.fulfillment_type} table={selectedOrder.table_number} />
                                    <PaymentTag status={selectedOrder.payment_status} method={selectedOrder.payment_method} />
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-on-surface transition-all">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Items */}
                            <div>
                                <h3 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-40">Items Ordered</h3>
                                <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl max-h-72 overflow-y-auto custom-scrollbar border border-outline-variant/5">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start py-3 border-b border-outline-variant/5 last:border-0">
                                            <div className="flex items-start gap-3">
                                                <span className="text-primary font-bold text-xs tabular-nums">{item.quantity}×</span>
                                                <div>
                                                    <span className="font-bold text-[12px] uppercase tracking-tight text-on-surface block leading-none">{item.item_name}</span>
                                                    <span className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest mt-1 block">₹{Number(item.price).toFixed(2)} each</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-on-surface text-xs tabular-nums">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 flex justify-between items-center border-t border-outline-variant/10">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50">Total</span>
                                        <span className="font-bold text-on-surface text-sm tabular-nums">₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 opacity-40">Order Status</h3>
                                    <div className="bg-white border border-outline-variant/10 p-6 rounded-2xl shadow-sm">
                                        <StatusProgressBar status={selectedOrder.status} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                                        <Button
                                            variant="default"
                                            className="w-full h-12 rounded-xl bg-[#1a1c1d] text-white font-bold uppercase tracking-widest text-[9px] shadow-lg border-none"
                                            onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: 'delivered', payment_status: 'paid' })}
                                        >
                                            <span className="material-symbols-outlined text-sm mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                            Mark as Delivered
                                        </Button>
                                    )}
                                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                                        <Button
                                            variant="secondary"
                                            className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] text-red-500 hover:bg-red-50 border-outline-variant/10"
                                            onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: 'cancelled' })}
                                        >
                                            Cancel Order
                                        </Button>
                                    )}
                                    {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                                        <div className="p-4 bg-slate-50 rounded-xl text-center">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">
                                                {selectedOrder.status === 'delivered' ? '✓ Order Completed' : '✗ Order Cancelled'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
