'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import { addOrder } from '@/store/slices/ordersSlice';
import { createPublicOrder } from '@/api/menu';
import { initiatePublicPayment, verifyPublicPayment } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  const table = searchParams.get('table');
  const groupId = searchParams.get('group');
  const queryStr = tenant ? `?tenant=${tenant}${table ? `&table=${table}` : ''}${groupId ? `&group=${groupId}` : ''}` : '';

  const dispatch = useDispatch();
  const { items: localItems } = useSelector((state: RootState) => state.cart);
  const { success, error } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
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

  const { data: groupSession } = useQuery({
    queryKey: ['group-order', groupId],
    queryFn: async () => {
        if (!groupId) return null;
        const res = await api.get(`/group-orders/${groupId}`);
        return res.data;
    },
    enabled: !!groupId
  });

  const displayItems = groupId && groupSession ? groupSession.items : localItems;
  const subtotal = groupId && groupSession 
    ? Number(groupSession.total_amount) 
    : localItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const deliverySurcharge = displayItems.length > 0 ? 4.50 : 0;
  const total = subtotal + deliverySurcharge;

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isHost, setIsHost] = useState(false);

  React.useEffect(() => {
    setIsHost(localStorage.getItem('is_group_host') === 'true');
  }, []);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (displayItems.length === 0) return;
    if (groupId && !isHost) return; // Extra safety check

    if (tenant) {
      setIsSubmitting(true);

      if (paymentMethod === 'razorpay') {
        try {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            error('Razorpay SDK failed to load. Are you online?');
            setIsSubmitting(false);
            return;
          }

          const initData = await initiatePublicPayment(tenant, {
            items: localItems.map(i => ({ menu_item_id: Number(i.id), quantity: i.quantity })),
            table_number: table || formData.address,
            notes: '',
            customer_name: formData.fullName || 'Guest Customer',
            customer_phone: formData.phone || '',
            fulfillment_type: table ? 'dine_in' : 'takeaway',
            type: 'online'
          });

          const options = {
            key: initData.key_id,
            amount: initData.amount,
            currency: initData.currency,
            name: initData.restaurant_name,
            description: 'Online Food Ordering Payment',
            order_id: initData.razorpay_order_id,
            handler: async (response: any) => {
              try {
                const verifyData = await verifyPublicPayment(tenant, {
                  temp_order_id: initData.temp_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                });
                
                dispatch(clearCart());
                success('Payment successful! Order confirmed.');
                setTimeout(() => router.push(`/menu${queryStr}`), 1000);
              } catch (err: any) {
                error('Payment verification failed: ' + (err.response?.data?.message || err.message));
                setIsSubmitting(false);
              }
            },
            prefill: {
              name: formData.fullName || 'Guest Customer',
              contact: formData.phone || ''
            },
            theme: {
              color: '#a63300'
            },
            modal: {
              ondismiss: () => {
                error('Payment cancelled by user.');
                setIsSubmitting(false);
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (err: any) {
          error('Failed to initiate online payment: ' + (err.response?.data?.message || err.message));
          setIsSubmitting(false);
        }
        return;
      }

      try {
        if (groupId) {
            await api.post(`/group-orders/${groupId}/finalize`);
        } else {
            await createPublicOrder(tenant, {
                items: localItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
                table_number: table || formData.address,
                notes: '',
                payment_method: paymentMethod,
                customerName: formData.fullName || 'Guest Customer'
            });
        }
        
        dispatch(clearCart());
        success('Order placed successfully! Preparing your items.');
        setTimeout(() => router.push(`/menu${queryStr}`), 1000);
      } catch (err) {
        error('Failed to place order. Please try again.');
        setIsSubmitting(false);
      }
      return;
    }

    // Mock flow if no tenant
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: displayItems.map((i: any) => ({ ...i })),
      total: total,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      customerName: formData.fullName || 'Guest Customer',
      orderType: 'online' as const,
    };

    dispatch(addOrder(newOrder));
    dispatch(clearCart());
    
    success('Order placed successfully! Preparing your items.');
    setTimeout(() => router.push('/menu'), 1000);
  };

  return (
    <div className="bg-[#f5f6f7] min-h-screen antialiased">
      <header className="bg-white dark:bg-zinc-950 flex justify-between items-center w-full px-8 py-5 sticky top-0 z-[60] shadow-sm">
        <Link href={`/menu${queryStr}`} className="text-2xl font-black text-[#a63300] italic font-headline">{tenantInfo?.name || 'Restaurant'}</Link>
        <div className="flex items-center gap-6 text-[#595c5d]">
          <Link href={`/menu${queryStr}`} className="hover:text-[#a63300]">Menu</Link>
          <Link href={`/cart${queryStr}`} className="relative hover:text-[#a63300]">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -top-2 -right-2 bg-[#a63300] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {displayItems.length}
            </span>
          </Link>
        </div>
      </header>

      <main className="pt-12 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Side: Delivery & Payment Details */}
          <div className="w-full lg:w-2/3 space-y-12">
            {(!groupId || isHost) ? (
              <>
                <section>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-8 text-[#2c2f30] font-headline">Secure Checkout</h1>
                  
                  {/* Delivery Details */}
                  <Card className="bg-[#eff1f2] border-none p-8 space-y-8">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#a63300]">local_shipping</span>
                      <h2 className="text-xl font-bold tracking-tight uppercase text-[#595c5d]">Delivery Logistics</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#595c5d] px-1">Full Name</label>
                        <input 
                          className="w-full bg-[#dadddf] border-none rounded-lg p-4 focus:ring-0 focus:border-b-2 focus:border-[#a63300] transition-all outline-none" 
                          placeholder="e.g. Julian Casablancas" 
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#595c5d] px-1">Phone Number</label>
                        <input 
                          className="w-full bg-[#dadddf] border-none rounded-lg p-4 focus:ring-0 focus:border-b-2 focus:border-[#a63300] transition-all outline-none" 
                          placeholder="+1 (555) 000-0000" 
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#595c5d] px-1">Delivery Address</label>
                        <input 
                          className="w-full bg-[#dadddf] border-none rounded-lg p-4 focus:ring-0 focus:border-b-2 focus:border-[#a63300] transition-all outline-none" 
                          placeholder="123 Foodsoul Way, Gastronomy District" 
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                    </div>
                  </Card>
                </section>

                {/* Payment Selection */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a63300]">payments</span>
                    <h2 className="text-xl font-bold tracking-tight uppercase text-[#595c5d]">Settlement Method</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button onClick={() => setPaymentMethod('razorpay')} className={`group flex flex-col items-start p-6 bg-white border-2 hover:border-[#a63300]/20 focus:border-[#a63300] rounded-xl transition-all text-left shadow-sm ${paymentMethod === 'razorpay' ? 'border-[#a63300]' : 'border-transparent'}`}>
                      <span className="material-symbols-outlined text-[#a63300] text-3xl mb-4">account_balance</span>
                      <span className="font-bold text-lg">Pay Online</span>
                      <span className="text-sm text-[#595c5d]">UPI, Netbanking, Cards</span>
                    </button>
                    <button onClick={() => setPaymentMethod('card')} className={`group flex flex-col items-start p-6 bg-white border-2 hover:border-[#a63300]/20 focus:border-[#a63300] rounded-xl transition-all text-left shadow-sm ${paymentMethod === 'card' ? 'border-[#a63300]' : 'border-transparent'}`}>
                      <span className="material-symbols-outlined text-[#a63300] text-3xl mb-4">credit_card</span>
                      <span className="font-bold text-lg">Bank Card</span>
                      <span className="text-sm text-[#595c5d]">Visa, Mastercard</span>
                    </button>
                    <button onClick={() => setPaymentMethod('wallet')} className={`group flex flex-col items-start p-6 bg-white border-2 hover:border-[#a63300]/20 focus:border-[#a63300] rounded-xl transition-all text-left shadow-sm ${paymentMethod === 'wallet' ? 'border-[#a63300]' : 'border-transparent'}`}>
                      <span className="material-symbols-outlined text-[#a63300] text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                      <span className="font-bold text-lg">Digital Wallet</span>
                      <span className="text-sm text-[#595c5d]">Apple/Google Pay</span>
                    </button>
                    <button onClick={() => setPaymentMethod('cash')} className={`group flex flex-col items-start p-6 bg-white border-2 hover:border-[#a63300]/20 focus:border-[#a63300] rounded-xl transition-all text-left shadow-sm ${paymentMethod === 'cash' ? 'border-[#a63300]' : 'border-transparent'}`}>
                      <span className="material-symbols-outlined text-[#a63300] text-3xl mb-4">payments</span>
                      <span className="font-bold text-lg">Pay at Counter</span>
                      <span className="text-sm text-[#595c5d]">Cash or Card</span>
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] shadow-sm text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-pulse">lock</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2c2f30]">Payment Locked</h2>
                  <p className="text-[#595c5d] mt-2 max-w-sm mx-auto">
                    You are part of a group order. Only the Host (<strong>{groupSession?.host_name}</strong>) can finalize and pay for the order.
                  </p>
                </div>
                <Link href={`/cart${queryStr}`}>
                  <Button variant="outline" className="rounded-full px-8">Back to Cart</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Side: Order Summary Card */}
          <aside className="w-full lg:w-1/3 lg:sticky lg:top-32">
            <div className="bg-white rounded-xl p-8 shadow-[0px_20px_40px_rgba(44,47,48,0.06)] space-y-8">
              <h3 className="text-2xl font-black italic text-[#a63300] font-headline">Your Selection</h3>
              <div className="space-y-6 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-[#e6e8ea] overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={item.image_url || item.menu_item?.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80`} 
                        alt={item.name || item.menu_item?.name} 
                        className="w-full h-full object-cover" 
                      />
                      {item.added_by_name && (
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[8px] text-center py-0.5">
                          {item.added_by_name}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <p className="font-bold text-[#2c2f30]">{item.name || item.menu_item?.name}</p>
                        <p className="font-bold text-[#a63300]">₹{(Number(item.price || item.menu_item?.price) * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-[#595c5d] uppercase tracking-wider">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-dashed border-[#abadae] space-y-3">
                <div className="flex justify-between items-center text-[#595c5d]">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="text-sm font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#595c5d]">
                  <span className="text-sm font-medium">Delivery Surcharge</span>
                  <span className="text-sm font-bold">₹{deliverySurcharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-black tracking-tighter uppercase font-headline">Total Amount</span>
                  <span className="text-2xl font-black text-[#a63300] font-headline">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                className="w-full py-5 rounded-full bg-gradient-to-r from-[#a63300] to-[#ff7949] text-white font-bold text-lg tracking-tight shadow-lg shadow-[#a63300]/20 active:scale-95 transition-transform border-none h-16 disabled:opacity-50"
                disabled={displayItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
              </Button>
              <p className="text-[10px] text-center text-[#595c5d] uppercase tracking-[0.2em] font-bold">
                Encrypted & Secured by Foodsoul
              </p>
            </div>
            
            <div className="mt-6 p-6 rounded-xl bg-[#005e9f]/5 flex items-start gap-4">
              <span className="material-symbols-outlined text-[#00528b]">auto_awesome</span>
              <div>
                <p className="text-sm font-bold text-[#003258]">{tenantInfo?.name || 'Restaurant'} Rewards</p>
                <p className="text-xs text-[#003b67]/80">You're earning {Math.floor(total * 10)} points with this order toward your next reservation.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
