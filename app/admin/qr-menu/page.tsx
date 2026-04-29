'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function QrMenuPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantDomain = user?.tenant?.domain || 'demo';
  const [tableNumber, setTableNumber] = useState('1');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
    `${typeof window !== 'undefined' ? window.location.origin : ''}/menu?tenant=${tenantDomain}&table=${tableNumber}`
  )}`;

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto w-full space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface uppercase italic font-headline">QR <span className="text-primary italic">Ordering</span></h1>
          <p className="text-on-surface-variant font-medium text-sm opacity-50 mt-1">Generate and manage table-side self-service portals.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Settings */}
        <div className="space-y-8">
            <Card className="p-8 bg-white border border-outline-variant/10 shadow-sm rounded-[2.5rem] space-y-6">
                <div>
                    <h3 className="text-lg font-black text-on-surface uppercase tracking-tight font-headline">Table Assignment</h3>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Configure QR destination</p>
                </div>
                
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Table / Area Identifier</label>
                    <input 
                        type="text" 
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-black text-sm uppercase tracking-tight text-on-surface"
                        placeholder="e.g. 12, VIP, Patio-A"
                    />
                </div>

                <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 leading-relaxed">
                        Scanning this code will redirect guests directly to the digital menu. Orders placed will automatically be assigned to the identifier above.
                    </p>
                </div>
            </Card>

            <Card className="p-8 bg-emerald-50 border border-emerald-100 shadow-sm rounded-[2.5rem]">
                <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-emerald-600">verified_user</span>
                    <div>
                        <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Active Module</h4>
                        <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest mt-1">QR self-checkout is fully operational for your node.</p>
                    </div>
                </div>
            </Card>
        </div>

        {/* Preview */}
        <div className="flex justify-center items-start">
            <Card className="p-10 bg-white border border-outline-variant/10 shadow-2xl rounded-[3rem] w-full max-w-sm flex flex-col items-center text-center group">
                <div className="w-full aspect-square bg-slate-50 rounded-3xl mb-8 p-6 border-2 border-dashed border-outline-variant/20 group-hover:border-primary/50 transition-colors">
                    <img src={qrUrl} alt={`QR Code for Table ${tableNumber}`} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                
                <h3 className="text-2xl font-black text-on-surface italic tracking-tighter font-headline mb-2">{user?.tenant?.name || 'Foodsoul Node'}</h3>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 py-1.5 rounded-full mb-8">Table {tableNumber || '?'}</p>

                <div className="flex gap-4 w-full">
                    <Button 
                        variant="secondary"
                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-sm"
                        onClick={() => {
                            window.open(qrUrl, '_blank');
                        }}
                    >
                        <span className="material-symbols-outlined mr-2 text-lg">print</span>
                        Print
                    </Button>
                    <Button 
                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none"
                    >
                        <span className="material-symbols-outlined mr-2 text-lg">download</span>
                        Save Image
                    </Button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
