'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, Order } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/utils';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import api from '@/api/client';

export default function KitchenPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const { success, error } = useToast();

  const { data: dashboardData } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: async () => {
      const response = await api.get('/tenant/dashboard');
      return response.data;
    }
  });

  const isShiftEnabled = dashboardData?.modules?.shift_management;

  const { data: shiftStatus } = useQuery({
    queryKey: ['shift-status'],
    queryFn: async () => {
      const response = await api.get('/tenant/shifts/status');
      return response.data;
    },
    enabled: !!isShiftEnabled
  });

  const toggleShiftMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tenant/shifts/toggle');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shift-status'] });
      success(data.message);
    },
    onError: (err: any) => {
      error(err.response?.data?.message || err.message || 'Shift operation failed');
    }
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => fetchOrders(),
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) => 
        updateOrderStatus(id, { status }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    }
  });

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  // Only show active kitchen orders
  const activeOrders = orders?.filter(o => 
    ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)
  ) || [];

  return (
    <div className="flex flex-col min-h-screen bg-surface p-10 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline uppercase italic">Kitchen KDS</h1>
          <p className="text-on-surface-variant text-lg font-medium">Network Station: Hot Line • Live Queue</p>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 p-3 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-black">
                    {user?.name?.charAt(0)}
                </div>
                <div className="hidden sm:block">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Executive Station</p>
                </div>
                {isShiftEnabled && (
                  <button 
                    onClick={() => toggleShiftMutation.mutate()}
                    disabled={toggleShiftMutation.isPending}
                    className={cn(
                      "h-8 px-4 rounded-lg font-black uppercase tracking-widest text-[8px] transition-all border flex items-center gap-2 ml-4",
                      shiftStatus?.is_clocked_in 
                      ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                      : "bg-[#1a1c1d] text-white border-transparent hover:bg-primary"
                    )}
                  >
                    <span className="material-symbols-outlined text-[12px]">{shiftStatus?.is_clocked_in ? 'timer_off' : 'timer'}</span>
                    {shiftStatus?.is_clocked_in ? 'Clock Out' : 'Clock In'}
                  </button>
                )}
                <button title="Log Out" onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-error hover:bg-error/5 transition-all ml-2">
                    <span className="material-symbols-outlined text-2xl">logout</span>
                </button>
            </div>
            
            <div className="bg-primary/5 border border-primary/10 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Queue Load</span>
                <span className="text-3xl font-black text-primary">{activeOrders.length}</span>
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {activeOrders.map(order => (
                <div 
                    key={order.id} 
                    className={cn(
                        "p-8 rounded-3xl flex flex-col h-full min-h-[450px] transition-all",
                        order.status === 'pending' ? "bg-white border-4 border-primary shadow-xl scale-105 z-10" : "bg-surface-container-lowest shadow-lg border border-outline-variant/10",
                        order.status === 'ready' && "opacity-60 grayscale-[0.5]"
                    )}
                >
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest block mb-1 text-on-surface-variant">Order {order.order_number}</span>
                            <h2 className="text-3xl font-black text-on-surface font-headline italic uppercase leading-none">
                                {order.table_number ? `TABLE ${order.table_number}` : 'TAKEAWAY'}
                            </h2>
                        </div>
                        <Badge variant={order.status === 'ready' ? "success" : "default"} className="font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1">
                            {order.status}
                        </Badge>
                    </div>

                    <div className="flex-grow space-y-5 mb-8">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/5">
                                <span className="text-2xl font-black text-primary bg-primary/10 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">
                                    {item.quantity}
                                </span>
                                <div className="pt-1">
                                    <span className="text-lg font-bold text-on-surface block leading-tight">{item.item_name}</span>
                                    {/* Mocking modifiers for now if any */}
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1 block">Standard Prep</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-auto">
                        {(order.status === 'pending' || order.status === 'accepted') && (
                            <Button 
                                size="lg" 
                                className="h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                                onClick={() => statusMutation.mutate({ id: order.id, status: 'preparing' })}
                                disabled={statusMutation.isPending}
                            >
                                <span className="material-symbols-outlined mr-2">play_circle</span> Start Cooking
                            </Button>
                        )}
                        {order.status === 'preparing' && (
                            <Button 
                                size="lg" 
                                variant="secondary"
                                className="h-16 rounded-2xl font-black uppercase tracking-[0.2em] bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                onClick={() => statusMutation.mutate({ id: order.id, status: 'ready' })}
                                disabled={statusMutation.isPending}
                            >
                                <span className="material-symbols-outlined mr-2">check_circle</span> Finish Batch
                            </Button>
                        )}
                        {order.status === 'ready' && (
                            <div className="text-center p-4 rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5">
                                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                                    {order.fulfillment_type === 'dine_in' 
                                        ? 'Ready to Serve' 
                                        : order.fulfillment_type === 'delivery' 
                                        ? 'Waiting for Delivery Staff' 
                                        : 'Waiting for Pickup'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {activeOrders.length === 0 && (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">inventory_2</span>
                    <h3 className="text-xl font-bold uppercase tracking-widest opacity-40">No orders in queue</h3>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
