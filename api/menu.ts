import api from './client';

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  is_available: boolean;
  is_veg: boolean;
  prep_time: number | null;
  is_whatsapp_visible?: boolean;
  ingredients?: any[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  menu_items?: MenuItem[];
}

export const fetchMenu = async (isAdmin = false): Promise<Category[]> => {
  const response = await api.get(`/tenant/menu${isAdmin ? '?admin=1' : ''}`);
  return response.data;
};

export const createCategory = async (data: Partial<Category>) => {
  const response = await api.post('/tenant/menu/categories', data);
  return response.data;
};

export const createMenuItem = async (data: Partial<MenuItem>) => {
  const response = await api.post('/tenant/menu/items', data);
  return response.data;
};

export const updateMenuItem = async (id: number, data: Partial<MenuItem>) => {
  const response = await api.put(`/tenant/menu/items/${id}`, data);
  return response.data;
};

export const deleteMenuItem = async (id: number) => {
  const response = await api.delete(`/tenant/menu/items/${id}`);
  return response.data;
};

// Public QR API
export const fetchPublicMenu = async (domain: string): Promise<Category[]> => {
  const response = await api.get(`/public/menu/${domain}`);
  return response.data;
};

export const createPublicOrder = async (domain: string, data: any) => {
  const response = await api.post(`/public/orders/${domain}`, data);
  return response.data;
};
