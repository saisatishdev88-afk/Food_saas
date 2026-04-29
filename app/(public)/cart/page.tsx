'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeItem, updateQuantity } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function CartPage() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  const table = searchParams.get('table');
  const queryStr = tenant ? `?tenant=${tenant}${table ? `&table=${table}` : ''}` : '';

  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const serviceCharge = subtotal * 0.05;
  const total = subtotal + tax + serviceCharge;

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeItem(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  return (
    <div className="bg-[#f5f6f7] min-h-screen pb-32">
      <header className="bg-white dark:bg-zinc-950 flex justify-between items-center w-full px-8 py-5 sticky top-0 z-40 shadow-sm">
        <Link href={`/menu${queryStr}`} className="text-2xl font-black text-[#a63300] italic font-headline">Foodsoul</Link>
        <div className="flex items-center space-x-6 text-[#595c5d]">
          <Link href={`/menu${queryStr}`} className="hover:text-[#a63300]">Menu</Link>
          <div className="relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -top-2 -right-2 bg-[#a63300] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {items.length}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Items Section */}
          <div className="lg:col-span-8 space-y-8">
            <header className="flex items-baseline justify-between border-none">
              <h1 className="text-4xl font-extrabold tracking-tighter text-[#2c2f30] font-headline">Your Selection</h1>
              <span className="text-sm uppercase tracking-widest text-[#595c5d] font-bold">
                {items.length} {items.length === 1 ? 'Item' : 'Items'} Total
              </span>
            </header>

            {items.length === 0 ? (
              <Card className="p-12 text-center space-y-6">
                <span className="material-symbols-outlined text-6xl text-[#abadae]">shopping_cart_off</span>
                <p className="text-[#595c5d]">Your cart is looking a bit hungry.</p>
                <Link href={`/menu${queryStr}`}>
                  <Button variant="default">Back to Menu</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-xl flex flex-col sm:flex-row gap-6 items-center group transition-all hover:bg-[#eff1f2]">
                    <div className="w-32 h-32 rounded-lg bg-[#e6e8ea] overflow-hidden flex-shrink-0">
                      <img 
                        src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80`} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-[#2c2f30] tracking-tight">{item.name}</h3>
                          <p className="text-[#595c5d] text-sm mt-1">Premium ingredients, expertly crafted</p>
                        </div>
                        <span className="text-lg font-black text-[#2c2f30]">₹{item.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center bg-[#e0e3e4] rounded-full p-1">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#a63300] hover:bg-[#dadddf] rounded-full transition-colors active:scale-90"
                          >
                            <span className="material-symbols-outlined text-xl">remove</span>
                          </button>
                          <span className="w-12 text-center font-bold text-[#2c2f30]">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#a63300] hover:bg-[#dadddf] rounded-full transition-colors active:scale-90"
                          >
                            <span className="material-symbols-outlined text-xl">add</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => dispatch(removeItem(item.id))}
                          className="text-[#b31b25] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-4">
            <div className="bg-[#eff1f2] p-8 rounded-xl sticky top-24">
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
                <Link href={`/checkout${queryStr}`}>
                  <Button 
                    className="w-full h-14 bg-gradient-to-r from-[#a63300] to-[#ff7949] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all border-none"
                    disabled={items.length === 0}
                  >
                    <span>Proceed to Checkout</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Button>
                </Link>
                <Link href={`/menu${queryStr}`}>
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
                  <p className="text-sm text-[#595c5d]">Estimated 25-30 minutes for {items.length} items.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
