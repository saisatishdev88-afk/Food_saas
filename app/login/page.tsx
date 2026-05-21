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
  const [deviceConflict, setDeviceConflict] = useState<any>(null);
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
      
      localStorage.setItem('tenant_token', data.token);
      localStorage.setItem('tenant_user', JSON.stringify(data.user));
      localStorage.setItem('tenant_role', data.role);
      localStorage.setItem('tenant_loginTime', Date.now().toString());

      dispatch(setCredentials({
        user: data.user,
        role: data.role,
        token: data.token,
      }));
      success('Authentication successful! Loading your dashboard...');

    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.sessions) {
        setDeviceConflict(err.response.data);
      } else {
        const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
        setError(msg);
        toastError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogoutAll = async () => {
    try {
        setLoading(true);
        // We need an email to force logout. The backend currently takes userId.
        // We might need to adjust the backend or use a different endpoint.
        // For now, let's assume we can trigger a 'clear-sessions' endpoint with email/pass.
        await api.post('/login/clear-sessions', { email, password });
        setDeviceConflict(null);
        success('All other sessions cleared. You can now sign in.');
    } catch (err: any) {
        toastError(err.response?.data?.message || 'Failed to clear sessions');
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

      {/* Device Conflict Modal */}
      {deviceConflict && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-error/10 text-error rounded-2xl flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-3xl">devices_off</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic mb-2">Device Limit Reached</h3>
                  <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-40 mb-8">
                      You are already logged in on {deviceConflict.sessions.length} devices. Netflix style, you need to logout from them to continue.
                  </p>
                  
                  <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {deviceConflict.sessions.map((s: any) => (
                          <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-outline-variant/10 flex justify-between items-center group hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-primary text-sm">laptop_mac</span>
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black uppercase tracking-tight text-on-surface">{s.ip || s.device || 'Previous Session'}</p>
                                      <p className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase">{s.last_active || 'Inactive'}</p>
                                  </div>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                          </div>
                      ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                        onClick={handleForceLogoutAll}
                        disabled={loading}
                        className="w-full h-14 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                    >
                        {loading ? 'Clearing...' : 'Logout from All Devices'}
                        <span className="material-symbols-outlined text-sm">logout</span>
                    </Button>
                    <button 
                        onClick={() => setDeviceConflict(null)}
                        className="w-full h-14 bg-slate-50 text-on-surface/40 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-outline-variant/10"
                    >
                        Cancel
                    </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
