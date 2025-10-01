import { apiRequest } from '@/src/utils/http';
import type { LoginRequest, LoginResponse } from '../types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>('api/auth/login', {
    method: 'POST',
    body: credentials,
    requiresAuth: false,
  });
};

export const register = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>('api/auth/signup', {
    method: 'POST',
    body: credentials,
    requiresAuth: false,
  });
};

export const logout = async (): Promise<void> => {
  await apiRequest<void>('auth/logout', {
    method: 'POST',
  });
  
  localStorage.removeItem('token');
};