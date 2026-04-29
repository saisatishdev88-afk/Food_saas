import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  customerName?: string;
  tableNumber?: string;
  orderType: 'online' | 'dine-in' | 'takeaway';
}

interface OrdersState {
  orders: Order[];
}

const initialState: OrdersState = {
  orders: [
    // Pre-filled demo data
    {
      id: 'ORD-2481',
      items: [{ id: 1, name: 'Truffle Pasta', price: 24, quantity: 1 }],
      total: 24,
      status: 'ready',
      createdAt: new Date().toISOString(),
      tableNumber: '04',
      orderType: 'dine-in'
    },
    {
      id: 'ORD-2482',
      items: [{ id: 2, name: 'Margherita Pizza', price: 18.5, quantity: 1 }],
      total: 18.5,
      status: 'preparing',
      createdAt: new Date().toISOString(),
      orderType: 'online'
    }
  ],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
  },
});

export const { addOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
