import { apiRequest } from '@/src/utils/http';
import type { Protocol, CreateProtocolRequest, UpdateProtocolRequest } from '../types/protocol';
import type { PaginationRequestParams } from '@/src/global/pagination/types/pagination';

export const getProtocols = async (params?: PaginationRequestParams): Promise<any> => {
  return apiRequest<any>('/api/protocols', {
    method: 'GET',
    params
  });
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

export const getTemplates = async (params?: PaginationRequestParams): Promise<any> => {
  return apiRequest<any>('/api/templates', {
    method: 'GET',
    params
  });
};

export const getTemplateById = async (id: string): Promise<Protocol> => {
  return apiRequest<Protocol>(`/api/templates/${id}`);
};

export const createTemplate = async (templateData: Omit<CreateProtocolRequest, 'clientId'>): Promise<Protocol> => {
  return apiRequest<Protocol>('/api/templates', {
    method: 'POST',
    body: { ...templateData, isTemplate: true },
  });
};

export const updateTemplate = async (id: string, templateData: Omit<UpdateProtocolRequest, 'clientId'>): Promise<Protocol> => {
  return apiRequest<Protocol>(`/api/templates/${id}`, {
    method: 'PUT',
    body: { ...templateData, isTemplate: true },
  });
};

export const deleteTemplate = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/templates/${id}`, {
    method: 'DELETE',
  });
};