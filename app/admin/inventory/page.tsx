'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', stock_level: 0, alert_threshold: 10 });
  const { success, error } = useToast();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await api.get('/tenant/inventory');
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingItem) {
        return await api.put(`/tenant/inventory/${editingItem.id}`, data);
      }
      return await api.post('/tenant/inventory', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ name: '', stock_level: 0, alert_threshold: 10 });
      success(editingItem ? 'Item updated successfully' : 'Item added successfully');
    },
    onError: () => {
      error('Failed to save item');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/tenant/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      success('Item deleted successfully');
    },
    onError: () => {
      error('Failed to delete item');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, stock_level: item.stock_level, alert_threshold: item.alert_threshold });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1500px] mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic">Stock <span className="text-primary italic">Inventory</span></h2>
          <p className="text-on-surface-variant font-medium text-sm opacity-50">Manage ingredients, supplies, and automated low-stock alerts.</p>
        </div>
        <Button 
            onClick={() => {
                setEditingItem(null);
                setFormData({ name: '', stock_level: 0, alert_threshold: 10 });
                setIsModalOpen(true);
            }}
            className="bg-[#1a1c1d] text-white px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none shadow-2xl hover:bg-primary transition-all active:scale-95"
        >
            Add New Item
        </Button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-outline-variant/5 overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-[#fcfdff] border-b border-outline-variant/5 text-on-surface-variant uppercase text-[9px] font-black tracking-[0.2em]">
              <th className="py-6 px-10 w-[40%]">Item Name</th>
              <th className="py-6 px-10 w-[20%]">Current Stock</th>
              <th className="py-6 px-10 w-[20%]">Alert Threshold</th>
              <th className="py-6 px-10 w-[20%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {isLoading ? (
              <tr><td colSpan={4} className="py-24 text-center font-black uppercase tracking-widest text-[10px] opacity-20">Loading inventory...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="py-24 text-center italic opacity-20">No inventory items found.</td></tr>
            ) : items.map((item: any) => {
              const isLowStock = item.stock_level <= item.alert_threshold;
              return (
                <tr key={item.id} className="hover:bg-[#fcfdff] transition-all group">
                  <td className="py-8 px-10">
                    <p className="font-black text-on-surface text-base tracking-tighter truncate italic font-headline">{item.name}</p>
                    {isLowStock && (
                        <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">Low Stock</span>
                    )}
                  </td>
                  <td className="py-8 px-10">
                    <span className={`font-black text-xl tabular-nums tracking-tighter italic font-headline ${isLowStock ? 'text-red-600' : 'text-on-surface'}`}>
                        {item.stock_level}
                    </span>
                  </td>
                  <td className="py-8 px-10">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase opacity-40">
                      {item.alert_threshold}
                    </span>
                  </td>
                  <td className="py-8 px-10 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(item)} className="w-10 h-10 rounded-xl bg-white border border-outline-variant/10 text-on-surface-variant flex items-center justify-center hover:bg-[#1a1c1d] hover:text-white transition-all shadow-sm">
                            <span className="material-symbols-outlined text-lg">edit_document</span>
                        </button>
                        <button onClick={() => deleteMutation.mutate(item.id)} className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <span className="material-symbols-outlined text-lg">delete_sweep</span>
                        </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
            <header className="bg-[#1a1c1d] p-10 text-white relative">
              <h3 className="text-2xl font-black font-headline uppercase italic tracking-tighter">{editingItem ? 'Update' : 'Add'} <span className="text-primary italic">Item</span></h3>
            </header>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Item Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-black text-sm uppercase tracking-tight text-on-surface" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Current Stock</label>
                    <input required type="number" step="0.01" value={formData.stock_level} onChange={(e) => setFormData({...formData, stock_level: parseFloat(e.target.value)})} className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-black text-sm uppercase tracking-tight text-on-surface tabular-nums" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Alert Threshold</label>
                    <input required type="number" step="0.01" value={formData.alert_threshold} onChange={(e) => setFormData({...formData, alert_threshold: parseFloat(e.target.value)})} className="w-full h-14 px-6 bg-slate-50 border border-outline-variant/10 focus:border-primary rounded-2xl outline-none transition-all font-black text-sm uppercase tracking-tight text-on-surface tabular-nums" />
                  </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-outline-variant/10">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest" > Cancel </Button>
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1 h-14 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all border-none" > {saveMutation.isPending ? 'Saving...' : 'Save Item'} </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
