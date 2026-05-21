import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; role: string; token: string }>
    ) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        const isSaas = window.location.pathname.startsWith('/saas') || window.location.pathname.startsWith('/admin/login');
        const prefix = isSaas ? 'saas_' : 'tenant_';
        localStorage.removeItem(`${prefix}token`);
        localStorage.removeItem(`${prefix}user`);
        localStorage.removeItem(`${prefix}role`);
        localStorage.removeItem(`${prefix}loginTime`);
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
