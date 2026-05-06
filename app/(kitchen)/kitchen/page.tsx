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
  const [activeFilter, setActiveFilter] = React.useState<'active' | 'ready' | 'all'>('active');
  const [itemFilter, setItemFilter] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState<string>('');
  
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [dropdownSearch, setDropdownSearch] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const itemsPerPage = 8;

  React.useEffect(() => {
    const updateTime = () => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

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
    refetchInterval: 5000 // Refresh every 5 seconds for tighter alerts
  });

  // Sound Alert Logic
  const lastOrderId = React.useRef<number | null>(null);
  
  React.useEffect(() => {
    if (orders && orders.length > 0) {
        const currentMaxId = Math.max(...orders.map(o => o.id));
        
        // If we have a previous max ID and the new max is higher, it's a new order
        if (lastOrderId.current !== null && currentMaxId > lastOrderId.current) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio playback blocked until user interaction:', e));
        }
        
        lastOrderId.current = currentMaxId;
    }
  }, [orders]);

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

  // Base filtered orders for status only, used for calculating available items
  const statusFilteredOrders = React.useMemo(() => {
    if (!orders) return [];
    if (activeFilter === 'active') {
        return orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status));
    }
    if (activeFilter === 'ready') {
        return orders.filter(o => o.status === 'ready');
    }
    return orders;
  }, [orders, activeFilter]);

  // Aggregate items for the footer dropdown
  const itemAggregates = React.useMemo(() => {
    const counts: Record<string, number> = {};
    statusFilteredOrders.forEach(o => {
        o.items?.forEach(i => {
            counts[i.item_name] = (counts[i.item_name] || 0) + i.quantity;
        });
    });
    return Object.entries(counts).map(([name, qty]) => ({ name, qty }));
  }, [statusFilteredOrders]);

  // Final filtered orders
  const filteredOrders = React.useMemo(() => {
      let result = statusFilteredOrders;
      if (itemFilter) {
          result = result.filter(o => o.items?.some(i => i.item_name === itemFilter));
      }
      return result;
  }, [statusFilteredOrders, itemFilter]);

  const activeOrders = filteredOrders.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdff] relative">
      <div className="flex flex-col md:flex-row justify-between items-start p-10 pb-4 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{user?.tenant?.name || 'Executive Node'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant opacity-30"></span>
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest opacity-50">Hot Line Station</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline uppercase italic leading-none">Kitchen KDS</h1>
          <p className="text-on-surface-variant text-lg font-medium opacity-60">Real-time Order Distribution & Management</p>
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
        <div className="px-10 pb-40">
            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-10 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/50">
                <button 
                    onClick={() => { setActiveFilter('active'); setCurrentPage(0); setItemFilter(null); }}
                    className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeFilter === 'active' ? "bg-primary text-white shadow-lg" : "text-on-surface-variant hover:bg-white/50")}
                >Active Queue</button>
                <button 
                    onClick={() => { setActiveFilter('ready'); setCurrentPage(0); setItemFilter(null); }}
                    className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeFilter === 'ready' ? "bg-emerald-500 text-white shadow-lg" : "text-on-surface-variant hover:bg-white/50")}
                >Ready to Serve</button>
                <button 
                    onClick={() => { setActiveFilter('all'); setCurrentPage(0); setItemFilter(null); }}
                    className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeFilter === 'all' ? "bg-slate-700 text-white shadow-lg" : "text-on-surface-variant hover:bg-white/50")}
                >Order History</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
                {activeOrders.map(order => (
                    <div 
                        key={order.id} 
                        className={cn(
                            "p-6 rounded-[2.5rem] flex flex-col h-full min-h-[420px] transition-all duration-500",
                            order.status === 'pending' ? "bg-white border-[6px] border-primary shadow-2xl scale-105 z-10" : "bg-white shadow-lg border border-outline-variant/10",
                            order.status === 'ready' && "opacity-80"
                        )}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-40">#{order.order_number}</span>
                                    {order.type === 'online' && <span className="bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">QR Order</span>}
                                    {order.type === 'whatsapp' && <span className="bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">WhatsApp</span>}
                                </div>
                                <h2 className="text-2xl font-black text-on-surface font-headline italic uppercase leading-none">
                                    {order.table_number ? `TABLE ${order.table_number}` : 'TAKEAWAY'}
                                </h2>
                            </div>
                            <div className={cn("w-3 h-3 rounded-full animate-pulse", order.status === 'pending' ? "bg-primary" : "bg-emerald-500")}></div>
                        </div>

                        <div className="flex-grow space-y-3 mb-6">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-outline-variant/5">
                                    <span className="text-lg font-black text-primary bg-white shadow-sm w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
                                        {item.quantity}
                                    </span>
                                    <span className="text-sm font-bold text-on-surface block leading-tight uppercase truncate">{item.item_name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <div className="flex items-center gap-2 mb-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-30">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                Received {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            
                            {(order.status === 'pending' || order.status === 'accepted') && (
                                <Button 
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 border-none bg-primary text-white"
                                    onClick={() => statusMutation.mutate({ id: order.id, status: 'preparing' })}
                                    disabled={statusMutation.isPending}
                                >
                                    Start Preparation
                                </Button>
                            )}
                            {order.status === 'preparing' && (
                                <Button 
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 border-none hover:bg-emerald-600"
                                    onClick={() => statusMutation.mutate({ id: order.id, status: 'ready' })}
                                    disabled={statusMutation.isPending}
                                >
                                    Mark as Ready
                                </Button>
                            )}
                            {order.status === 'ready' && (
                                <div className="text-center py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest text-[9px] border border-emerald-100">
                                    Dispatched
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 mt-12 mb-32">
                    <button 
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-20 hover:scale-110 transition-transform"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Page {currentPage + 1} of {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-20 hover:scale-110 transition-transform"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            )}

            {filteredOrders.length === 0 && (
                <div className="py-60 flex flex-col items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-7xl mb-4 opacity-10">orders</span>
                    <h3 className="text-xl font-bold uppercase tracking-[0.3em] opacity-20 italic">No orders in queue</h3>
                </div>
            )}
            <div className="h-40" /> {/* Dedicated Spacer for Fixed Footer */}
        </div>
      )}

      {/* Dynamic Aggregate Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#1a1c1d] text-white py-5 px-10 z-[100] border-t border-white/5 shadow-[0_-20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md bg-opacity-95">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-10">
              <div className="flex items-center gap-6 flex-1">
                  <div className="flex items-center gap-3 pr-6 border-r border-white/10 shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">filter_list</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Filter Kitchen</span>
                  </div>
                  
                  <div className="relative" ref={dropdownRef}>
                      <button 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 focus:border-primary transition-all flex items-center justify-between min-w-[300px]"
                      >
                          <span>{itemFilter ? `FILTER BY ${itemFilter}` : `SHOW ALL ORDERS (${statusFilteredOrders.length})`}</span>
                          <span className="material-symbols-outlined text-sm">{isDropdownOpen ? 'expand_less' : 'expand_more'}</span>
                      </button>
                      
                      {isDropdownOpen && (
                          <div className="absolute bottom-[calc(100%+0.5rem)] left-0 w-[400px] bg-[#1a1c1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col z-[101]">
                              <div className="p-3 border-b border-white/10">
                                  <div className="relative">
                                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">search</span>
                                      <input 
                                          type="text" 
                                          autoFocus
                                          placeholder="SEARCH ITEMS..." 
                                          value={dropdownSearch}
                                          onChange={(e) => setDropdownSearch(e.target.value)}
                                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all placeholder:text-white/20"
                                      />
                                  </div>
                              </div>
                              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                  <button
                                      onClick={() => { setItemFilter(null); setCurrentPage(0); setIsDropdownOpen(false); setDropdownSearch(''); }}
                                      className={cn("w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all", !itemFilter ? "text-primary bg-primary/5" : "text-white/70")}
                                  >
                                      SHOW ALL ORDERS ({statusFilteredOrders.length})
                                  </button>
                                  {itemAggregates.filter(item => item.name.toLowerCase().includes(dropdownSearch.toLowerCase())).map(item => (
                                      <button
                                          key={item.name}
                                          onClick={() => { setItemFilter(item.name); setCurrentPage(0); setIsDropdownOpen(false); setDropdownSearch(''); }}
                                          className={cn("w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex justify-between items-center", itemFilter === item.name ? "text-primary bg-primary/5" : "text-white/70")}
                                      >
                                          <span>{item.name}</span>
                                          <span className="opacity-50">QTY: {item.qty}</span>
                                      </button>
                                  ))}
                                  {itemAggregates.filter(item => item.name.toLowerCase().includes(dropdownSearch.toLowerCase())).length === 0 && (
                                      <div className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                                          No items found
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              <div className="flex items-center gap-10 shrink-0 pl-10 border-l border-white/10">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">System Live</span>
                  </div>
                  <div className="text-2xl font-black font-headline italic tracking-tighter text-white min-w-[100px] text-right">
                      {currentTime}
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
}
