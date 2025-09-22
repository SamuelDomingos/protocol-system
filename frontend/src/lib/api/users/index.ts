import { apiRequest } from '@/src/utils/http';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user';

export const getUsers = async (): Promise<User[]> => {
  return apiRequest<User[]>('/api/users');
};

export const getUserById = async (id: string): Promise<User> => {
  return apiRequest<User>(`/api/users/${id}`);
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  return apiRequest<User>('/api/users', {
    method: 'POST',
    body: userData,
  });
};

export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<User> => {
  return apiRequest<User>(`/api/users/${id}`, {
    method: 'PUT',
    body: userData,
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/users/${id}`, {
    method: 'DELETE',
  });
};