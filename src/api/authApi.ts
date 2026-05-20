import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_BASE_API || 'http://localhost:8080/api';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password?: string;
}

export interface RegisterResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (user) => ({
        url: '/auth/register',
        method: 'POST',
        body: user,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
export default authApi;
