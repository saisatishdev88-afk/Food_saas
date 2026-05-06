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

export default function AdminLoginPage() {
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
      // Use the unified API client which already has the baseURL and headers setup
      const { data } = await api.post('/admin/login', { email, password });
      
      // Store token for the axios client interceptor
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.role);
      localStorage.setItem('loginTime', Date.now().toString());

      dispatch(setCredentials({
        user: data.user,
        role: data.role,
        token: data.token,
      }));
      success('SaaS Root Access Granted. Loading Console...');

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f6f7] min-h-screen flex flex-col justify-center items-center p-6 selection:bg-[#ff7949]/30 selection:text-primary">
      <main className="w-full max-w-md">
        {/* Brand Identity Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#a63300] text-4xl">restaurant_menu</span>
            <span className="text-2xl font-extrabold tracking-tight text-[#2c2f30] uppercase font-headline">Foodsoul</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e0e3e4] rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#006b1b]"></span>
            <span className="text-[10px] font-bold tracking-widest text-[#595c5d] uppercase">Network Status: Optimal</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white rounded-xl shadow-[0px_20px_40px_rgba(44,47,48,0.06)] p-10 relative overflow-hidden border-none">
          {/* Subtle accent background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#a63300]/5 rounded-full blur-3xl"></div>
          
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-[#2c2f30] tracking-tight mb-2 font-headline uppercase italic">Foodsoul SaaS Console</h1>
            <p className="text-[#595c5d] text-sm font-sans">SaaS Platform Root & Network Administration</p>
          </header>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}
            
            {/* Admin Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#595c5d] uppercase tracking-widest ml-1" htmlFor="email">Admin Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#757778]">
                  <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                </div>
                <input 
                  className="block w-full h-14 pl-12 pr-4 bg-[#dadddf]/50 border-0 border-b-2 border-transparent focus:border-[#a63300] focus:ring-0 transition-all rounded-t-lg text-[#2c2f30] placeholder-[#757778]/50 outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="e.g. root@foodsoul.io" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Security Key Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="block text-xs font-bold text-[#595c5d] uppercase tracking-widest" htmlFor="password">Security Key</label>
                <button type="button" className="text-xs font-semibold text-[#a63300] hover:underline transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#757778]">
                  <span className="material-symbols-outlined text-[20px]">encrypted</span>
                </div>
                <input 
                  className="block w-full h-14 pl-12 pr-12 bg-[#dadddf]/50 border-0 border-b-2 border-transparent focus:border-[#a63300] focus:ring-0 transition-all rounded-t-lg text-[#2c2f30] placeholder-[#757778]/50 outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Device */}
            <div className="flex items-center gap-3 py-2">
              <input 
                className="w-5 h-5 rounded border-[#abadae] text-[#a63300] focus:ring-[#a63300] transition-all" 
                id="remember" 
                name="remember" 
                type="checkbox"
              />
              <label className="text-sm font-medium text-[#595c5d] select-none cursor-pointer" htmlFor="remember">Remember this device</label>
            </div>

            {/* Submit Button */}
            <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-[#a63300] to-[#ff7949] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group border-none"
                disabled={loading}
            >
              <span className="tracking-tight">{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
              {!loading && <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">login</span>}
            </Button>
          </form>

          {/* Bottom Meta */}
          <div className="mt-10 pt-6 border-t border-[#abadae]/10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e6e8ea] rounded-sm">
              <span className="material-symbols-outlined text-[16px] text-[#006b1b]">verified_user</span>
              <span className="text-[10px] font-bold text-[#595c5d] tracking-widest uppercase">Secure Root Access V2.4</span>
            </div>
          </div>
        </Card>

        {/* System Footer */}
        <footer className="mt-12 text-center space-y-4">
          <div className="flex justify-center gap-6">
            <button className="text-xs font-semibold text-[#757778] hover:text-[#2c2f30] transition-colors">Privacy Policy</button>
            <button className="text-xs font-semibold text-[#757778] hover:text-[#2c2f30] transition-colors">Terms of Service</button>
            <button className="text-xs font-semibold text-[#757778] hover:text-[#2c2f30] transition-colors">Security Status</button>
          </div>
          <p className="text-[10px] text-[#757778] tracking-widest uppercase">© 2024 Foodsoul Culinary Systems. All rights reserved.</p>
        </footer>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff7949]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#91f78e]/10 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
