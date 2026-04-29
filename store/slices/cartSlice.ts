import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  order_type: 'online' | 'offline';
}

const initialState: CartState = {
  items: [],
  order_type: 'online',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((i) => i.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string | number; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setOrderType: (state, action: PayloadAction<'online' | 'offline'>) => {
      state.order_type = action.payload;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, setOrderType } = cartSlice.actions;
export default cartSlice.reducer;
