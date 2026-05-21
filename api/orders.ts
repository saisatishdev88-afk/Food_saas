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
  type: 'offline' | 'online' | 'whatsapp';
  total_amount: number;
  tax_amount: number;
  service_charge: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  payment_type: string | null;
  payment_response: Record<string, any> | null;
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

export const updateOrderStatus = async (id: number, data: { status: Order['status']; payment_status?: Order['payment_status']; payment_method?: string; type?: string }) => {
  const response = await api.put(`/tenant/orders/${id}/status`, data);
  return response.data;
};

export const initiatePublicPayment = async (domain: string, data: {
  items: { menu_item_id: number; quantity: number }[];
  table_number?: string;
  notes?: string;
  customer_name?: string;
  customer_phone?: string;
  fulfillment_type?: 'dine_in' | 'takeaway' | 'delivery';
  type?: 'offline' | 'online' | 'whatsapp';
}) => {
  const response = await api.post(`/public/orders/${domain}/payment-init`, data);
  return response.data;
};

export const verifyPublicPayment = async (domain: string, data: {
  temp_order_id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post(`/public/orders/${domain}/payment-verify`, data);
  return response.data;
};

export const initiatePOSPayment = async (data: {
  items: { menu_item_id: number; quantity: number }[];
  table_number?: string;
  notes?: string;
  customer_name?: string;
  customer_phone?: string;
  fulfillment_type?: 'dine_in' | 'takeaway' | 'delivery';
  type?: 'offline' | 'online' | 'whatsapp';
}) => {
  const response = await api.post('/tenant/orders/payment-init', data);
  return response.data;
};

export const verifyPOSPayment = async (data: {
  temp_order_id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post('/tenant/orders/payment-verify', data);
  return response.data;
};

export const fetchRazorpayConfig = async () => {
  const response = await api.get('/tenant/razorpay/config');
  return response.data;
};

export const updateRazorpayConfig = async (data: {
  key_id: string;
  key_secret?: string;
  enabled: boolean;
}) => {
  const response = await api.post('/tenant/razorpay/config', data);
  return response.data;
};

export const initiatePOSOrderPayment = async (orderId: number) => {
  const response = await api.post(`/tenant/orders/${orderId}/payment-init`);
  return response.data;
};

export const verifyPOSOrderPayment = async (orderId: number, data: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post(`/tenant/orders/${orderId}/payment-verify`, data);
  return response.data;
};

