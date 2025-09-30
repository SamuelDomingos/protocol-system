import { apiRequest } from '@/src/utils/http';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user';

export const getUsers = async (): Promise<User[]> => {
  return await apiRequest<User[]>('/api/users');
};

export const getUserById = async (id: string): Promise<User> => {
  return await apiRequest<User>(`/api/users/${id}`);
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  return await apiRequest<User>('/api/users', {
    method: 'POST',
    body: userData
  });
};

export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<User> => {
  return await apiRequest<User>(`/api/users/${id}`, {
    method: 'PUT',
    body: userData
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  return await apiRequest<void>(`/api/users/${id}`, {
    method: 'DELETE'
  });
};

export const getUserPermissions = async (id: string): Promise<any> => {
  return await apiRequest<any>(`/api/users/${id}/permissions`);
};
