import { apiRequest } from '@/src/utils/http';
import type { Client, CreateClientRequest, UpdateClientRequest, ClientSearchParams } from '../types';

export const getClients = async (params?: ClientSearchParams): Promise<Client[]> => {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  const endpoint = queryString ? `clients?${queryString}` : 'clients';
  
  return apiRequest<Client[]>(endpoint);
};

export const getClientById = async (id: number): Promise<Client> => {
  return apiRequest<Client>(`clients/${id}`);
};

export const createClient = async (data: CreateClientRequest): Promise<Client> => {
  return apiRequest<Client>('clients', {
    method: 'POST',
    body: data,
  });
};

export const updateClient = async (id: number, data: UpdateClientRequest): Promise<Client> => {
  return apiRequest<Client>(`clients/${id}`, {
    method: 'PUT',
    body: data,
  });
};

export const deleteClient = async (id: number): Promise<void> => {
  return apiRequest<void>(`clients/${id}`, {
    method: 'DELETE',
  });
};

export const searchClients = async (search: string): Promise<Client[]> => {
  return apiRequest<Client[]>(`clients/search?search=${encodeURIComponent(search)}`);
};