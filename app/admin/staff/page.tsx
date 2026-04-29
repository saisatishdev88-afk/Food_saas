'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export default function TenantStaffPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter'
  });
  const [formError, setFormError] = useState('');
  const { success, error } = useToast();

  // Fetch current staff
  const { data: staff, isLoading } = useQuery({
    queryKey: ['tenant-staff'],
    queryFn: async () => {
      const response = await api.get('/tenant/staff');
      return response.data;
    }
  });

  // Mutation to add staff
  const addMutation = useMutation({
    mutationFn: (newStaff: typeof formData) => api.post('/tenant/staff', newStaff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-staff'] });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'waiter' });
      setFormError('');
      success('Staff member recruited successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to add staff member';
      setFormError(msg);
      error(msg);
    }
  });

  // Mutation to delete staff
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tenant/staff/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tenant-staff'] });
        success('Staff access revoked successfully');
    },
    onError: () => {
        error('Failed to revoke staff access');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    addMutation.mutate(formData);
  };

  const staffMembers = staff || [];

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto w-full space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline uppercase">Our Local Team</h2>
          <p className="text-on-surface-variant font-medium">Manage your restaurant personnel and digital credentials.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-8 h-12 rounded-xl font-bold border-none shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
        >
          Add New Personnel
        </Button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            <div className="col-span-full h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
        ) : staffMembers.length === 0 ? (
            <Card className="col-span-full p-12 text-center text-on-surface-variant italic bg-surface-container-low border-dashed border-2 border-outline-variant/30">
                You haven't recruited any staff yet. Start by adding a new team member.
            </Card>
        ) : staffMembers.map((member: any) => (
            <Card key={member.id} className="p-6 hover:shadow-md transition-shadow group relative overflow-hidden border-outline-variant/10">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-2xl uppercase">
                        {member.name.charAt(0)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        member.role === 'chef' ? 'bg-orange-100 text-orange-700' :
                        member.role === 'waiter' ? 'bg-blue-100 text-blue-700' :
                        member.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {member.role}
                    </div>
                </div>
                
                <h3 className="font-bold text-lg text-on-surface mb-1">{member.name}</h3>
                <p className="text-xs text-on-surface-variant mb-6 font-medium">{member.email}</p>
                
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Status: Authorized</span>
                    <button 
                        onClick={() => deleteMutation.mutate(member.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors"
                        title="Remove Staff"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_remove</span>
                    </button>
                </div>
            </Card>
        ))}
      </div>

      {/* Recuitment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="bg-primary p-10 text-on-primary">
              <h3 className="text-3xl font-bold font-headline">New Team Member</h3>
              <p className="text-on-primary/70 text-sm mt-1">Add a new digital identity to your restaurant floor.</p>
            </header>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {formError && (
                <div className="p-4 bg-error-container/20 text-error text-xs font-bold rounded-xl border border-error/10 uppercase tracking-tight">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Personnel Name</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full h-12 px-5 bg-surface-container-high border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-medium text-on-surface" />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Work Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full h-12 px-5 bg-surface-container-high border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-medium appearance-none text-on-surface">
                        <option value="waiter">Waiter / Floor Staff</option>
                        <option value="chef">Chef / Kitchen Staff</option>
                        <option value="manager">Outlet Manager</option>
                        <option value="delivery">Delivery Partner</option>
                    </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Staff Work Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@work.com" className="w-full h-12 px-5 bg-surface-container-high border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-medium text-on-surface" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Temporary Access Key</label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full h-12 px-5 bg-surface-container-high border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-medium text-on-surface" />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1 h-14 rounded-2xl font-bold border-outline-variant/10 text-on-surface-variant" > Discard </Button>
                <Button type="submit" disabled={addMutation.isPending} className="flex-1 h-14 bg-primary text-on-primary rounded-2xl font-bold hover:opacity-90 transition-opacity border-none shadow-lg shadow-primary/20" > {addMutation.isPending ? 'Recruiting...' : 'Authorize Staff'} </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
