'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, Order } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/utils';

export default function DeliveryDashboardPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => fetchOrders(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) => 
        updateOrderStatus(id, { status }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    }
  });

  // Filters
  const readyOrders = orders?.filter(o => o.status === 'ready') || [];
  const activeOrders = orders?.filter(o => o.status === 'preparing') || []; // Simulated variety
  const completedOrders = orders?.filter(o => o.status === 'delivered') || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10">
      {/* Quick Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-outline-variant/10 p-8 rounded-3xl shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all cursor-default">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">To Pickup</p>
            <p className="text-4xl font-black text-on-surface">{readyOrders.length}</p>
          </div>
          <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">inventory</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/10 p-8 rounded-3xl shadow-sm flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-default">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">Active Deliveries</p>
            <p className="text-4xl font-black text-on-surface">{activeOrders.length}</p>
          </div>
          <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-3xl">local_shipping</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/10 p-8 rounded-3xl shadow-sm flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-default">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">Total Completed</p>
            <p className="text-4xl font-black text-on-surface">{completedOrders.length}</p>
          </div>
          <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-3xl">task_alt</span>
          </div>
        </div>
      </section>

      {/* Ready for Delivery List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <div>
                <h3 className="font-black text-2xl text-on-surface uppercase tracking-tight italic font-headline">Fulfillment Queue</h3>
                <p className="text-on-surface-variant text-sm font-medium">Orders validated and ready for dispatch</p>
            </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : readyOrders.length === 0 ? (
          <div className="p-20 text-center bg-surface-container-low/20 rounded-3xl border-4 border-dashed border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 mb-4 block">bike_scooter</span>
            <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs">No pending pickups available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {readyOrders.map(order => (
                <div key={order.id} className="bg-white border border-outline-variant/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row group">
                <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=400&h=300&auto=format&fit=crop" alt="Package" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 block mb-1">Destination</span>
                         <h5 className="text-white font-bold leading-tight uppercase italic">{order.table_number ? `TABLE ${order.table_number}` : 'TAKEAWAY'}</h5>
                    </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between gap-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-primary font-black text-xl tracking-tighter italic font-headline">#{order.order_number}</span>
                            <Badge variant="success" className="text-[9px] font-black uppercase tracking-widest px-3">READY</Badge>
                        </div>
                        <h4 className="font-black text-2xl text-on-surface tracking-tight uppercase leading-none">Standard Fulfillment</h4>
                        <div className="flex items-center gap-2 text-on-surface-variant mt-4">
                            <span className="material-symbols-outlined text-lg">schedule</span>
                            <span className="text-xs font-bold uppercase tracking-widest">Ordered 14m ago</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Revenue Value</span>
                        <span className="text-2xl font-black text-on-surface">₹{Number(order.total_amount).toFixed(2)}</span>
                    </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between border-t border-outline-variant/10 pt-8 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                             {order.items?.slice(0, 3).map((it, i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-surface-container-high border-4 border-white flex items-center justify-center text-[10px] font-black shadow-sm" title={it.item_name}>
                                    {it.item_name.charAt(0)}
                                </div>
                             ))}
                        </div>
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-2">
                             Full Parcel • {order.items?.length || 0} items
                        </span>
                    </div>
                    <Button 
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'delivered' })}
                        className="shadow-xl shadow-primary/20 rounded-2xl px-10 h-14 font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all w-full md:w-auto"
                        disabled={statusMutation.isPending}
                    >
                        {statusMutation.isPending ? 'Processing...' : 'Complete Delivery'}
                    </Button>
                    </div>
                </div>
                </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
