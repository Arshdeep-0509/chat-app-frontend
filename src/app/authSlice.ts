import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

const getInitialToken = (): string | null => {
  return localStorage.getItem('token');
};

const getInitialUser = (): AuthState['user'] => {
  const savedUser = localStorage.getItem('chatapp_user');
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  user: getInitialUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState['user'] }>
    ) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('chatapp_user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('chatapp_user');
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('chatapp_user', JSON.stringify(action.payload));
      }
    },
  },
});

export const { setCredentials, logout, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
export default authSlice;
