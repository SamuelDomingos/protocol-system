import { apiRequest } from '@/src/utils/http';
import type { PaginationRequestParams } from '@/src/global/pagination/types/pagination';
import type { Application, CreateApplicationRequest, UpdateApplicationRequest, ApplicationsResponse } from '../types/application';

export const getApplications = async (params?: PaginationRequestParams): Promise<ApplicationsResponse> => {
  return apiRequest<ApplicationsResponse>('/api/applications', {
    method: 'GET',
    params
  });
};

export const getApplicationById = async (id: string): Promise<Application> => {
  return apiRequest<Application>(`/api/applications/${id}`);
};

export const createApplication = async (applicationData: CreateApplicationRequest): Promise<Application> => {
  return apiRequest<Application>('/api/applications', {
    method: 'POST',
    body: applicationData,
  });
};

export const createApplicationWithFile = async (formData: FormData): Promise<Application> => {
  return apiRequest<Application>('/api/applications', {
    method: 'POST',
    body: formData,
  });
};

export const updateApplication = async (id: string, applicationData: UpdateApplicationRequest): Promise<Application> => {
  return apiRequest<Application>(`/api/applications/${id}`, {
    method: 'PUT',
    body: applicationData,
  });
};

export const deleteApplication = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/applications/${id}`, {
    method: 'DELETE',
  });
};

export const getApplicationsByStage = async (stageId: string): Promise<Application[]> => {
  return apiRequest<Application[]>(`/api/applications/stage/${stageId}`);
};

export const completeApplication = async (id: string): Promise<{ message: string; application: Application }> => {
  return apiRequest<{ message: string; application: Application }>(`/api/applications/${id}/complete`, {
    method: 'PATCH',
  });
};
