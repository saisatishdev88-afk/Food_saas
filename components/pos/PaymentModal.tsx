'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '@/api/orders';
import { Button } from '@/components/ui/Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  orderId: string | number;
  numericId: number;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, orderId, numericId }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'method' | 'qr'>('method');
  const [isPolled, setIsPolled] = useState(false);

  const paymentMutation = useMutation({
    mutationFn: (data: { status: any, payment_status: any, payment_method: string, type: string }) => 
        updateOrderStatus(numericId, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    }
  });

  const handleSuccess = (method: string) => {
    paymentMutation.mutate({ 
        status: 'accepted',
        payment_status: 'paid',
        payment_method: method === 'cash' ? 'Cash' : 'QR',
        type: method === 'cash' ? 'offline' : 'online'
    });
    
    if (method === 'cash') {
        onSuccess();
    } else {
        setIsPolled(true);
        setTimeout(() => {
            onSuccess();
        }, 2000);
    }
  };

  useEffect(() => {
    if (step === 'qr') {
      const timer = setTimeout(() => {
        handleSuccess('qr');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl scale-in-center overflow-hidden relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
        </button>

        {step === 'method' ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-4xl">payments</span>
            </div>
            <h2 className="text-3xl font-black font-headline uppercase italic tracking-tighter mb-2">Finalize Billing</h2>
            <p className="text-on-surface-variant font-medium mb-8">Amount Due: <span className="text-primary font-black">₹{amount.toFixed(2)}</span></p>
            
            <div className="grid grid-cols-1 gap-4 w-full">
                <button 
                    onClick={() => setStep('qr')}
                    className="flex justify-between items-center p-6 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-all border border-outline-variant/5"
                >
                    <div className="flex items-center gap-4 text-left">
                        <span className="material-symbols-outlined text-primary">qr_code_2</span>
                        <div>
                            <p className="font-bold uppercase tracking-widest text-[10px] text-primary">Digital Payment</p>
                            <p className="font-bold text-lg leading-tight uppercase italic">QR Code Scan</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>

                <button 
                    disabled={paymentMutation.isPending}
                    onClick={() => handleSuccess('cash')}
                    className="flex justify-between items-center p-6 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-all border border-outline-variant/5 disabled:opacity-50"
                >
                    <div className="flex items-center gap-4 text-left">
                        <span className="material-symbols-outlined text-emerald-600">payments</span>
                        <div>
                            <p className="font-bold uppercase tracking-widest text-[10px] text-emerald-600">Traditional</p>
                            <p className="font-bold text-lg leading-tight uppercase italic">Cash on Counter</p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
             {!isPolled ? (
                <>
                    <h2 className="text-2xl font-black font-headline uppercase italic tracking-tighter mb-2">Scan & Pay</h2>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-8 shrink-0">Terminal ID: BF-POS-01</p>
                    
                    <div className="bg-white p-6 rounded-3xl border-4 border-primary/20 mb-8 aspect-square w-64 flex items-center justify-center relative group">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BISTROFLOW-ORDER-${orderId}`} 
                            alt="QR Code" 
                            className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 border-4 border-primary animate-pulse opacity-20 pointer-events-none rounded-2xl"></div>
                    </div>

                    <div className="flex items-center gap-3 bg-surface-container-high px-6 py-3 rounded-full animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">Waiting for confirmation</span>
                    </div>
                </>
             ) : (
                <div className="py-6 scale-in-center">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black font-headline uppercase italic tracking-tighter mb-1">Payment Received</h2>
                    <p className="text-on-surface-variant font-medium text-xs mb-8">Order #{orderId} processed successfully.</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button 
                            variant="secondary" 
                            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                            onClick={() => window.print()}
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            Print KOT
                        </Button>
                        <Button 
                            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary text-white flex items-center justify-center gap-2 border-none"
                            onClick={onClose}
                        >
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            Next Order
                        </Button>
                    </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
