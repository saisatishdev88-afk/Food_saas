import api from './client';

export interface OrderItem {
  id: number;
  menu_item_id: number;
  item_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  type: 'offline' | 'online';
  total_amount: number;
  tax_amount: number;
  service_charge: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: string | null;
  table_number: string | null;
  fulfillment_type: 'dine_in' | 'takeaway' | 'delivery';
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

export const fetchOrders = async (params?: { status?: string; type?: string }): Promise<Order[]> => {
  const response = await api.get('/tenant/orders', { params });
  return response.data;
};

export const fetchOrderDetails = async (id: number): Promise<Order> => {
  const response = await api.get(`/tenant/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: {
  items: { menu_item_id: number; quantity: number }[];
  type: 'offline' | 'online';
  table_number?: string;
  notes?: string;
  payment_method?: string;
}) => {
  const response = await api.post('/tenant/orders', data);
  return response.data;
};

export const updateOrderStatus = async (id: number, data: { status: Order['status']; payment_status?: Order['payment_status'] }) => {
  const response = await api.put(`/tenant/orders/${id}/status`, data);
  return response.data;
};
