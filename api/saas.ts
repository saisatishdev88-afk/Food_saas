import api from './client';

export interface SaaSStats {
  total_restaurants: number;
  active_restaurants: number;
  total_users: number;
  global_revenue: number;
  system_health: string;
  ai_forecast?: any;
}

export interface Tenant {
  id: number;
  name: string;
  domain: string;
  email: string;
  plan_type: string;
  status: string;
  users_count?: number;
  created_at: string;
}

export const fetchSaaSStats = async (): Promise<SaaSStats> => {
  const { data } = await api.get('/saas/dashboard');
  return data;
};

export const fetchTenants = async (page = 1, search = '') => {
  const { data } = await api.get(`/saas/tenants?page=${page}&search=${search}`);
  return data;
};

export const createTenant = async (tenantData: Partial<Tenant>) => {
  const { data } = await api.post('/saas/tenants', tenantData);
  return data;
};
