import { apiRequest } from '@/src/utils/http';
import type { Client, CreateClientRequest, UpdateClientRequest, ClientSearchParams, ClientsPaginatedResponse } from '../types';

export const getClients = async (params?: ClientSearchParams): Promise<ClientsPaginatedResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const queryString = searchParams.toString();
  
  const endpoint = queryString ? `api/clients?${queryString}` : 'api/clients';
  return apiRequest<ClientsPaginatedResponse>(endpoint);
};

export const getClientById = async (id: number): Promise<Client> => {
  return apiRequest<Client>(`api/clients/${id}`);
};

export const createClient = async (data: CreateClientRequest): Promise<Client> => {
  return apiRequest<Client>('api/clients', {  
    method: 'POST',
    body: data,
  });
};

export const updateClient = async (id: number, data: UpdateClientRequest): Promise<Client> => {
  return apiRequest<Client>(`api/clients/${id}`, {
    method: 'PUT',
    body: data,
  });
};

export const deleteClient = async (id: number): Promise<void> => {
  return apiRequest<void>(`api/clients/${id}`, {
    method: 'DELETE',
  });
};

export const searchClients = async (search: string): Promise<Client[]> => {
  return apiRequest<Client[]>(`api/clients/search?search=${encodeURIComponent(search)}`);
};
