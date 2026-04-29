'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { mockLogin } from '@/api/mockAuth';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();

  const dispatch = useDispatch();
  
  // Custom hook that will redirect once role is set in redux
  useRoleRedirect();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Hit the real unified backend login
      const { data } = await api.post('/login', { email, password });
      
      localStorage.setItem('token', data.token);

      dispatch(setCredentials({
        user: data.user,
        role: data.role,
        token: data.token,
      }));
      success('Authentication successful! Loading your dashboard...');

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-surface text-on-background min-h-[100dvh] flex flex-col items-center justify-center py-12 px-6 bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80')", backgroundPosition: 'center', backgroundSize: 'cover' }}>
      <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm z-0"></div>
      
      <main className="w-full max-w-[480px] z-10 relative">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            <span className="text-3xl font-bold tracking-tighter text-on-surface font-headline">Foodsoul</span>
          </div>
          <div className="h-1 w-12 bg-primary-container rounded-full"></div>
        </div>

        <Card className="p-10 text-on-surface border-none shadow-2xl">
          <header className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight mb-2 font-headline">Operations Center</h1>
            <p className="text-on-surface-variant text-sm">Manager, Point of Sale, Kitchen, and Delivery Access</p>
          </header>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-error-container/20 text-error text-xs font-bold rounded-lg border border-error/20 text-center uppercase tracking-tight">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant px-1">
                Account Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">alternate_email</span>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline/40 outline-none font-medium" 
                  placeholder="e.g. owner@restaurant.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant px-1">
                Access Key
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                <input 
                  className="w-full h-14 pl-12 pr-12 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface outline-none font-medium" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="default" className="w-full h-14 rounded-2xl text-lg mt-4 w-full shadow-lg shadow-primary/20 font-bold bg-primary text-on-primary border-none hover:opacity-90 active:scale-95 transition-all" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Hub'}
              {!loading && <span className="material-symbols-outlined ml-2">login</span>}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-container flex flex-col items-center gap-4">
            <div className="flex gap-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Secure Environment</span>
            </div>
          </div>
        </Card>

        <footer className="mt-12 text-center text-sm text-on-surface-variant/60 font-medium">
          © 2024 Foodsoul Culinary Systems. <br className="md:hidden" /> All rights reserved.
        </footer>
      </main>
    </div>
  );
}
