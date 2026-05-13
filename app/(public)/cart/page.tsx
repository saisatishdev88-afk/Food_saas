'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeItem, updateQuantity } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/api/client';

export default function CartPage() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  const table = searchParams.get('table');
  const queryStr = tenant ? `?tenant=${tenant}${table ? `&table=${table}` : ''}` : '';

  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  // Group Ordering States
  const groupId = searchParams.get('group');
  const [groupSession, setGroupSession] = React.useState<any>(null);
  const [isHost, setIsHost] = React.useState(false);

  React.useEffect(() => {
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
        // Update the current group ID in storage to match the URL
        localStorage.setItem('current_group_id', groupId);
        
        const fetchGroup = async () => {
            try {
                const res = await api.get(`/group-orders/${groupId}`);
                setGroupSession(res.data);
            } catch (err) {
                console.error('Failed to fetch group session', err);
            }
        };
        fetchGroup();
        const interval = setInterval(fetchGroup, 5000);
        return () => clearInterval(interval);
    }
  }, [groupId]);

  const displayItems = groupId && groupSession ? groupSession.items : items;
  const subtotal = groupId && groupSession 
    ? Number(groupSession.total_amount) 
    : items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const tax = subtotal * 0.08;
  const serviceCharge = subtotal * 0.05;
  const total = subtotal + tax + serviceCharge;

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (groupId) return; // Group items are managed via menu
    if (quantity <= 0) {
      dispatch(removeItem(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  return (
    <div className="bg-[#f5f6f7] min-h-screen pb-32">
      <header className="bg-white dark:bg-zinc-950 flex justify-between items-center w-full px-8 py-5 sticky top-0 z-40 shadow-sm">
        <Link href={`/menu${queryStr}${groupId ? `&group=${groupId}` : ''}`} className="text-2xl font-black text-[#a63300] italic font-headline uppercase tracking-tighter">Foodsoul Hub</Link>
        <div className="flex items-center space-x-6 text-[#595c5d]">
          <Link href={`/menu${queryStr}${groupId ? `&group=${groupId}` : ''}`} className="hover:text-[#a63300]">Menu</Link>
          <div className="relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -top-2 -right-2 bg-[#a63300] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {displayItems.length}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {groupId && groupSession && (
            <div className="mb-8 p-6 bg-emerald-600 text-white rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Live Shared Cart</p>
                    <h3 className="text-xl font-bold">Host: {groupSession.host_name}</h3>
                </div>
                <div className="px-4 py-2 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                    Table {groupSession.table_number || 'N/A'}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Items Section */}
          <div className="lg:col-span-8 space-y-8">
            <header className="flex items-baseline justify-between border-none">
              <h1 className="text-4xl font-extrabold tracking-tighter text-[#2c2f30] font-headline">Your Selection</h1>
              <span className="text-sm uppercase tracking-widest text-[#595c5d] font-bold">
                {displayItems.length} {displayItems.length === 1 ? 'Item' : 'Items'} Total
              </span>
            </header>

            {displayItems.length === 0 ? (
              <Card className="p-12 text-center space-y-6 rounded-[2rem] border-none shadow-sm">
                <span className="material-symbols-outlined text-6xl text-[#abadae]">shopping_cart_off</span>
                <p className="text-[#595c5d]">Your cart is looking a bit hungry.</p>
                <Link href={`/menu${queryStr}`}>
                  <Button variant="default">Back to Menu</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center group transition-all hover:bg-[#eff1f2] border border-outline-variant/5">
                    <div className="w-32 h-32 rounded-xl bg-[#e6e8ea] overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={item.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80`} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                      {item.added_by_name && (
                          <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase text-center py-1">
                              By {item.added_by_name}
                          </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-[#2c2f30] tracking-tight">{item.name || item.menu_item?.name}</h3>
                          <p className="text-[#595c5d] text-sm mt-1">{item.description || item.menu_item?.description || 'Premium selection'}</p>
                        </div>
                        <span className="text-lg font-black text-[#2c2f30]">₹{(Number(item.price) || Number(item.menu_item?.price)).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center bg-[#e0e3e4] rounded-full p-1">
                          <button 
                            disabled={!!groupId}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#a63300] hover:bg-[#dadddf] rounded-full transition-colors active:scale-90 disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-xl">remove</span>
                          </button>
                          <span className="w-12 text-center font-bold text-[#2c2f30]">{item.quantity}</span>
                          <button 
                            disabled={!!groupId}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#a63300] hover:bg-[#dadddf] rounded-full transition-colors active:scale-90 disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-xl">add</span>
                          </button>
                        </div>
                        {!groupId && (
                            <button 
                              onClick={() => dispatch(removeItem(item.id))}
                              className="text-[#b31b25] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest">Remove</span>
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-4">
            <div className="bg-[#eff1f2] p-8 rounded-2xl sticky top-24 shadow-sm">
              <h2 className="text-2xl font-extrabold tracking-tighter text-[#2c2f30] mb-8 font-headline">Bill Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[#595c5d]">
                  <span className="text-xs uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="font-bold text-[#2c2f30]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#595c5d]">
                  <span className="text-xs uppercase tracking-widest font-bold">Taxes (8%)</span>
                  <span className="font-bold text-[#2c2f30]">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#595c5d]">
                  <span className="text-xs uppercase tracking-widest font-bold">Service Fee (5%)</span>
                  <span className="font-bold text-[#2c2f30]">₹{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="pt-6 mt-6 border-t-2 border-[#dadddf] flex justify-between items-end">
                  <span className="text-lg font-extrabold tracking-tighter text-[#2c2f30]">Total Amount</span>
                  <span className="text-3xl font-black text-[#a63300] tracking-tighter">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                {(!groupId || isHost) ? (
                  <Link href={`/checkout${queryStr}${groupId ? `&group=${groupId}` : ''}`}>
                    <Button 
                      className="w-full h-14 bg-gradient-to-r from-[#a63300] to-[#ff7949] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all border-none"
                      disabled={displayItems.length === 0}
                    >
                      <span>Proceed to Checkout</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Button>
                  </Link>
                ) : (
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-primary text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest">Waiting for Host to pay...</p>
                    <p className="text-[8px] opacity-60 mt-1 uppercase font-bold italic">Collaborative session active</p>
                  </div>
                )}
                <Link href={`/menu${queryStr}${groupId ? `&group=${groupId}` : ''}`}>
                  <button className="w-full h-14 bg-transparent text-[#a63300] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#dadddf] transition-all active:scale-95">
                    <span className="material-symbols-outlined">menu_book</span>
                    <span>Add more items</span>
                  </button>
                </Link>
              </div>

              <div className="mt-8 p-4 bg-white rounded-xl flex items-start gap-4">
                <span className="material-symbols-outlined text-[#006b1b] text-2xl">local_shipping</span>
                <div>
                  <p className="text-xs font-bold text-[#2c2f30] uppercase tracking-widest mb-1">Preparation Time</p>
                  <p className="text-sm text-[#595c5d]">Estimated 25-30 minutes for {displayItems.length} items.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
