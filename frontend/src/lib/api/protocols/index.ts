import { apiRequest } from '@/src/utils/http';
import type { Protocol, CreateProtocolRequest, UpdateProtocolRequest } from '../types/protocol';

export const getProtocols = async (): Promise<Protocol[]> => {
  return apiRequest<Protocol[]>('/api/protocols');
};

export const getProtocolById = async (id: string): Promise<Protocol> => {
  return apiRequest<Protocol>(`/api/protocols/${id}`);
};

export const createProtocol = async (protocolData: CreateProtocolRequest): Promise<Protocol> => {
  return apiRequest<Protocol>('/api/protocols', {
    method: 'POST',
    body: protocolData,
  });
};

export const updateProtocol = async (id: string, protocolData: UpdateProtocolRequest): Promise<Protocol> => {
  return apiRequest<Protocol>(`/api/protocols/${id}`, {
    method: 'PUT',
    body: protocolData,
  });
};

export const deleteProtocol = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/protocols/${id}`, {
    method: 'DELETE',
  });
};