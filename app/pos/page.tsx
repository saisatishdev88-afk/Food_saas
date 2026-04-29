'use client';

import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addItem, removeItem, updateQuantity, clearCart } from '@/store/slices/cartSlice';
import { addOrder } from '@/store/slices/ordersSlice';
import { fetchMenu } from '@/api/menu';
import { createOrder } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import PaymentModal from '@/components/pos/PaymentModal';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export default function PosPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { success, error } = useToast();
  const queryClient = useQueryClient();

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

  const [showPayment, setShowPayment] = React.useState(false);
  const [lastOrderDetails, setLastOrderDetails] = React.useState<{id: number, number: string} | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = React.useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [tableNumber, setTableNumber] = React.useState('1');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => fetchMenu(false) // Public view
  });

  const orderMutation = useMutation({
    mutationFn: (data: any) => createOrder(data),
    onSuccess: (data) => {
      setLastOrderDetails({ id: data.id, number: data.order_number });
      setShowPayment(true);
      dispatch(clearCart());
      success('Order synced successfully');
    },
    onError: (err: any) => {
      error('Order Sync Failure: ' + (err.response?.data?.message || err.message));
    }
  });

  const [activeCategory, setActiveCategory] = React.useState<number | null>(null);

  const handleLogout = () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
        router.push('/admin/dashboard');
        success('Returned to Dashboard');
    } else {
        dispatch(logout());
        success('Session ended');
        router.replace('/login');
    }
  };

  const filteredItems = React.useMemo(() => {
    if (!categories) return [];
    let itemsList = !activeCategory 
        ? categories.flatMap(c => c.menu_items || [])
        : categories.find(c => c.id === activeCategory)?.menu_items || [];
    
    if (searchQuery) {
        itemsList = itemsList.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    return itemsList;
  }, [categories, activeCategory, searchQuery]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // Standard 5% GST
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    if (items.length === 0) return;

    orderMutation.mutate({
      type: 'offline',
      fulfillment_type: fulfillmentMethod,
      table_number: fulfillmentMethod === 'dine_in' ? tableNumber : null,
      notes: `Order placed via Terminal. Method: ${fulfillmentMethod}`,
      items: items.map(i => ({
        menu_item_id: Number(i.id),
        quantity: i.quantity
      }))
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-[#f8fafc] text-on-surface overflow-hidden">
      {/* LEFT: Menu Content */}
      <section className="flex-1 flex flex-col min-w-0 bg-white shadow-sm z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold italic">BF</span>
                <div>
                   <h1 className="text-xl font-bold tracking-tight uppercase leading-none">Foodsoul POS</h1>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant opacity-40 mt-1">Terminal Active • {user?.name}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {isShiftEnabled && (
                  <button 
                    onClick={() => toggleShiftMutation.mutate()}
                    disabled={toggleShiftMutation.isPending}
                    className={`h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] transition-all border flex items-center gap-2 ${
                      shiftStatus?.is_clocked_in 
                      ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                      : "bg-[#1a1c1d] text-white border-transparent hover:bg-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{shiftStatus?.is_clocked_in ? 'timer_off' : 'timer'}</span>
                    {shiftStatus?.is_clocked_in ? 'Clock Out' : 'Clock In'}
                  </button>
                )}
                <div className="flex-1 max-w-sm relative ml-4">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input 
                        type="text"
                        placeholder="Search menu..."
                        className="w-full bg-slate-50 px-10 py-2.5 rounded-xl border border-outline-variant/10 focus:border-primary outline-none text-xs font-medium"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="w-10 h-10 p-0 rounded-xl">
                 <span className="material-symbols-outlined text-[20px] text-slate-400">logout</span>
            </Button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-3 border-b border-outline-variant/5 bg-slate-50/50 flex gap-2 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeCategory === null 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white text-on-surface-variant border border-outline-variant/10'
                }`}
            >All</button>
            {categories?.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeCategory === cat.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white text-on-surface-variant border border-outline-variant/10'
                    }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4 content-start custom-scrollbar">
          {filteredItems.map((item) => (
            <div 
                key={item.id} 
                onClick={() => dispatch(addItem({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 }))}
                className="bg-white rounded-2xl overflow-hidden border border-outline-variant/10 flex flex-col group cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all active:scale-95"
            >
              <div className="h-24 relative overflow-hidden">
                <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-white ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="p-3 flex flex-col gap-1">
                <h3 className="font-bold text-[13px] text-on-surface truncate leading-tight uppercase tracking-tight">{item.name}</h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-primary text-sm tabular-nums">₹{Number(item.price).toFixed(2)}</span>
                    <div className="w-6 h-6 rounded-lg bg-primary/5 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[14px]">add</span>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT: Cart */}
      <aside className="w-full md:w-[360px] lg:w-[420px] bg-white border-l border-outline-variant/10 flex flex-col shadow-2xl relative z-20">
          <div className="p-5 border-b border-outline-variant/10 space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['dine_in', 'takeaway', 'delivery'] as const).map(m => (
                      <button 
                        key={m}
                        onClick={() => setFulfillmentMethod(m)}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${fulfillmentMethod === m ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                      >
                          {m.replace('_', ' ')}
                      </button>
                  ))}
              </div>

              {fulfillmentMethod === 'dine_in' && (
                  <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">Table Assign</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setTableNumber(Math.max(1, Number(tableNumber) - 1).toString())} className="w-8 h-8 rounded-lg bg-white border border-primary/10 text-primary flex items-center justify-center">-</button>
                        <span className="w-8 text-center font-bold text-lg text-primary">{tableNumber}</span>
                        <button onClick={() => setTableNumber((Number(tableNumber) + 1).toString())} className="w-8 h-8 rounded-lg bg-white border border-primary/10 text-primary flex items-center justify-center">+</button>
                      </div>
                  </div>
              )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <span className="material-symbols-outlined text-4xl">shopping_basket</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Order queue empty</p>
                  </div>
              ) : (
                  items.map(item => (
                      <div key={item.id} className="p-4 bg-slate-50/50 rounded-2xl border border-outline-variant/5 group">
                          <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-[12px] uppercase text-on-surface leading-tight max-w-[70%]">{item.name}</h4>
                              <span className="font-bold text-sm text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-outline-variant/10">
                                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(0, item.quantity - 1) }))} className="w-6 h-6 hover:bg-slate-50 rounded flex items-center justify-center text-xs">-</button>
                                  <span className="w-6 text-center text-[11px] font-bold">{item.quantity}</span>
                                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="w-6 h-6 hover:bg-slate-50 rounded flex items-center justify-center text-xs">+</button>
                              </div>
                              <button onClick={() => dispatch(removeItem(item.id))} className="text-slate-300 hover:text-red-400 p-1">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                          </div>
                      </div>
                  ))
              )}
          </div>

          <div className="p-6 border-t border-outline-variant/10 bg-slate-50/30">
              <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>GST (5%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200 mt-4">
                      <span className="text-sm font-bold uppercase tracking-tight">Invoice Total</span>
                      <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
                  </div>
              </div>
              <Button 
                onClick={handlePlaceOrder}
                disabled={items.length === 0 || orderMutation.isPending}
                className="w-full h-12 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
              >
                  {orderMutation.isPending ? 'Syncing...' : 'Place Secure Order'}
              </Button>
          </div>
      </aside>

      {lastOrderDetails && (
        <PaymentModal 
            isOpen={showPayment} 
            onClose={() => setShowPayment(false)}
            onSuccess={() => {
                setShowPayment(false);
                setLastOrderDetails(null);
            }}
            amount={total}
            orderId={lastOrderDetails.number}
            numericId={lastOrderDetails.id}
        />
      )}
    </div>
  );
}
