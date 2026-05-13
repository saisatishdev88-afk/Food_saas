'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addItem } from '@/store/slices/cartSlice';
import { fetchMenu, fetchPublicMenu } from '@/api/menu';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import api from '@/api/client';

export default function CustomerMenuPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  const table = searchParams.get('table');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  // Group Ordering States
  const groupId = searchParams.get('group');
  const [guestName, setGuestName] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isTableOccupied, setIsTableOccupied] = useState(false);
  const [tableStatusLoading, setTableStatusLoading] = useState(false);

  useEffect(() => {
    // Robust host check
    const storedHostStatus = localStorage.getItem('is_group_host') === 'true';
    const storedGroupId = localStorage.getItem('current_group_id');
    
    // Only demote if we have a stored ID and it definitely doesn't match the URL
    if (groupId && storedHostStatus && storedGroupId && storedGroupId !== groupId) {
        setIsHost(false);
        localStorage.setItem('is_group_host', 'false');
    } else {
        setIsHost(storedHostStatus);
    }

    if (groupId) {
        localStorage.setItem('current_group_id', groupId);
        if (!localStorage.getItem('group_guest_name')) {
            setIsJoinModalOpen(true);
        }
    }
    const savedName = localStorage.getItem('group_guest_name');
    if (savedName) setGuestName(savedName);

    // Check Table Status
    if (tenant && table) {
        setTableStatusLoading(true);
        api.get(`/public/table/${tenant}/${table}/status`)
            .then(res => {
                if (res.data.is_occupied) {
                    setIsTableOccupied(true);
                }
            })
            .catch(err => console.error('Failed to check table status', err))
            .finally(() => setTableStatusLoading(false));
    }
  }, [groupId, tenant, table]);

  const { data: groupSession, refetch: refetchGroup } = useQuery({
    queryKey: ['group-session', groupId],
    queryFn: () => groupId ? api.get(`/group-orders/${groupId}`).then(res => res.data) : null,
    enabled: !!groupId,
    refetchInterval: 5000 // Polling every 5 seconds
  });

  const handleStartGroupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantInfo?.id) {
        alert("Restaurant context missing. Please ensure you are visiting via a valid QR link.");
        return;
    }
    
    try {
        const res = await api.post('/group-orders/start', {
            tenant_id: tenantInfo.id,
            host_name: guestName,
            table_number: table
        });
        localStorage.setItem('group_guest_name', guestName);
        localStorage.setItem('is_group_host', 'true');
        localStorage.setItem('current_group_id', res.data.session_token);
        const url = new URL(window.location.href);
        url.searchParams.set('group', res.data.session_token);
        window.location.href = url.toString();
    } catch (err: any) {
        console.error('Failed to start group order', err);
        alert("Failed to create shared cart: " + (err.response?.data?.message || err.message));
    }
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('group_guest_name', guestName);
    localStorage.setItem('is_group_host', 'false');
    setIsJoinModalOpen(false);
  };

  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-menu', tenant],
    queryFn: () => tenant ? fetchPublicMenu(tenant) : fetchMenu()
  });

  const { data: tenantInfo } = useQuery({
    queryKey: ['tenant-info', tenant],
    queryFn: async () => {
        if (!tenant) return null;
        const res = await api.get(`/public/tenant/${tenant}`);
        return res.data;
    },
    enabled: !!tenant
  });

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleAddItem = async (item: any) => {
    if (groupId) {
        const name = localStorage.getItem('group_guest_name');
        if (!name) {
            setIsJoinModalOpen(true);
            return;
        }
        
        try {
            await api.post(`/group-orders/${groupId}/items`, {
                menu_item_id: item.id,
                quantity: 1,
                added_by_name: name
            });
            refetchGroup();
        } catch (err: any) {
            console.error('Failed to add group item', err);
            alert("Failed to add item: " + (err.response?.data?.message || err.message));
        }
    } else {
        dispatch(addItem({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 }));
    }
  };

  const displayedItems = React.useMemo(() => {
    if (!categories) return [];
    if (activeCategory) {
        return categories.find(c => c.id === activeCategory)?.menu_items || [];
    }
    return categories.flatMap(c => c.menu_items || []);
  }, [categories, activeCategory]);

  return (
    <div className="bg-[#fcfdff] text-on-surface antialiased min-h-screen relative font-sans">
      {/* Table Occupied Overlay */}
      {isTableOccupied && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
              <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-500 text-center">
                  <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                      <span className="material-symbols-outlined text-5xl">lock</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase italic mb-4">Table Already Occupied</h3>
                  <p className="text-on-surface-variant text-sm font-bold opacity-60 mb-10 leading-relaxed">
                      This table is currently in use by another customer. Please wait until they vacate or scan another table QR code.
                  </p>
                  <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Need assistance?</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="w-full h-16 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                      >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          Check Again
                      </button>
                      <Link href="/" className="block">
                        <button className="w-full h-16 bg-slate-50 text-on-surface/40 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-outline-variant/10">Return to Home</button>
                      </Link>
                  </div>
              </div>
          </div>
      )}

      {/* Simple Header */}
      <header className="fixed top-0 z-50 w-full h-16 px-6 flex justify-between items-center bg-white border-b border-outline-variant/5">
        <div className="flex items-center gap-4">
          {tenantInfo?.logo ? (
              <img src={tenantInfo.logo} className="h-8 object-contain" alt={tenantInfo.name} />
          ) : (
              <span className="text-xl font-black text-primary tracking-tighter uppercase">{tenantInfo?.name || 'Menu'}</span>
          )}
          {table && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase">Table {table}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!groupId && (
            <button 
                onClick={() => setIsStartModalOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm"
            >
                <span className="material-symbols-outlined text-sm">groups</span>
                <span className="hidden xs:inline">Group Order</span>
            </button>
          )}
          <Link href={`/cart${tenant ? `?tenant=${tenant}` : ''}${table ? `&table=${table}` : ''}${groupId ? `&group=${groupId}` : ''}`}>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5">
              <span className="material-symbols-outlined text-primary text-xl">shopping_basket</span>
              {(groupId ? (groupSession?.items?.length || 0) : cartCount) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[9px] flex items-center justify-center rounded-full font-black">
                    {groupId ? groupSession.items.length : cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-32 px-4 max-w-7xl mx-auto">
        {/* Group Ordering Active Indicator */}
        {groupId && groupSession && (
            <div className="mb-8 bg-primary rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Collaborative Session Active</p>
                    <h3 className="text-xl font-bold">Host: {groupSession.host_name}</h3>
                    <p className="text-[10px] font-bold opacity-80 mt-1">
                        Shared Total: <span className="text-secondary-fixed font-black">₹{Number(groupSession.total_amount).toFixed(2)}</span> • {groupSession.items.length} items added
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            const url = `${window.location.origin}${window.location.pathname}?tenant=${tenant}&group=${groupId}${table ? `&table=${table}` : ''}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(`Join my group order at ${tenantInfo?.name}: ${url}`)}`, '_blank');
                        }}
                        className="bg-white text-emerald-600 px-6 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
                    >
                        <span className="material-symbols-outlined text-sm">share</span>
                        Invite
                    </button>
                </div>
            </div>
        )}

        {/* Simple Banner */}
        <section className="relative h-48 rounded-3xl overflow-hidden mb-8 shadow-xl">
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            src={tenantInfo?.banner_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200"} 
            alt="Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-white text-2xl font-black uppercase tracking-tight leading-none mb-1">
                {tenantInfo?.name || 'Welcome to Our Kitchen'}
            </h1>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Handcrafted Delicacies • Premium Service</p>
          </div>
        </section>

        {/* Horizontal Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6 sticky top-16 bg-[#fcfdff] z-40 py-2">
            <button 
                onClick={() => setActiveCategory(null)}
                className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === null ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-outline-variant/10 text-on-surface-variant'}`}
            >All Items</button>
            {categories?.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-outline-variant/10 text-on-surface-variant'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>

        {/* Menu Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6">
              {activeCategory ? categories?.find(c => c.id === activeCategory)?.name : 'Signature Selection'}
          </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center animate-in fade-in duration-700">
                    <div className="relative w-24 h-24 mb-6">
                        <span className="material-symbols-outlined text-6xl text-primary animate-bounce">restaurant</span>
                        <span className="material-symbols-outlined text-3xl text-secondary absolute -bottom-2 -right-2 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>skillet</span>
                    </div>
                    <p className="font-headline font-black text-xl uppercase tracking-tighter italic animate-pulse">Chef is preparing the menu...</p>
                    <div className="mt-4 flex gap-1">
                        {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                    </div>
                </div>
            )}
            {displayedItems.map(item => (
                <div key={item.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-outline-variant/5 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
                  <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-50 relative">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={item.name}/>
                    <div className="absolute top-4 left-4">
                        <div className={`w-3 h-3 rounded-full border border-white shadow-sm ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 px-2">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-black text-sm text-on-surface uppercase tracking-tight line-clamp-1">{item.name}</h3>
                      <span className="font-black text-primary text-sm shrink-0">₹{Number(item.price)}</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant leading-tight line-clamp-2 opacity-60 font-medium mb-4">{item.description}</p>
                    <button 
                        onClick={() => handleAddItem(item)}
                        className="mt-auto bg-primary/5 hover:bg-primary text-primary hover:text-white h-12 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 font-black uppercase tracking-widest text-[9px]"
                    >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Add to Plate
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </main>

      {/* Simplified Cart Button for QR scanned customers */}
      {(groupId ? (groupSession?.items?.length || 0) : cartCount) > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-lg">
          <Link href={`/cart${tenant ? `?tenant=${tenant}` : ''}${table ? `&table=${table}` : ''}${groupId ? `&group=${groupId}` : ''}`}>
            <div className="bg-[#1a1c1d] text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between group active:scale-95 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <div>
                    <p className="font-bold text-sm uppercase tracking-tight">{groupId ? groupSession.items.length : cartCount} Items Selected</p>
                    <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Payable: <span className="text-primary">₹{groupId ? Number(groupSession.total_amount).toFixed(2) : totalPrice.toFixed(2)}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-primary text-white px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Review Order
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Join Group Modal */}
      {isJoinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                  <h3 className="text-2xl font-black uppercase italic mb-2">Join Group Order</h3>
                  <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-40 mb-8">Enter your name to start contributing to the shared cart.</p>
                  <form onSubmit={handleJoinGroup} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest opacity-50 ml-1">Your Name</label>
                          <input 
                            required 
                            autoFocus
                            value={guestName} 
                            onChange={e => setGuestName(e.target.value)}
                            placeholder="e.g. Rahul S."
                            className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 rounded-2xl outline-none focus:border-primary font-bold text-sm"
                          />
                      </div>
                      <Button type="submit" className="w-full h-14 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Join Selection</Button>
                  </form>
              </div>
          </div>
      )}

      {/* Start Group Modal */}
      {isStartModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 relative">
                  <button onClick={() => setIsStartModalOpen(false)} className="absolute top-8 right-8 text-on-surface/20 hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                  <h3 className="text-2xl font-black uppercase italic mb-2">Start Group Session</h3>
                  <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-40 mb-8">Create a shared cart and invite friends via WhatsApp.</p>
                  <form onSubmit={handleStartGroupOrder} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest opacity-50 ml-1">Host Name</label>
                          <input 
                            required 
                            autoFocus
                            value={guestName} 
                            onChange={e => setGuestName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 rounded-2xl outline-none focus:border-primary font-bold text-sm"
                          />
                      </div>
                      <Button type="submit" className="w-full h-14 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                        Create Shared Cart
                      </Button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
