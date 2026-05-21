import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api', // Default fallback
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

api.interceptors.request.use((config) => {
  // We can't access Redux store directly here easily without circular dependencies sometimes,
  // but we can either pass token manually or read from localStorage if stored there.
  if (typeof window !== 'undefined') {
    const isSaas = window.location.pathname.startsWith('/saas') || window.location.pathname.startsWith('/admin/login');
    const prefix = isSaas ? 'saas_' : 'tenant_';
    const token = localStorage.getItem(`${prefix}token`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
