import { apiRequest } from '@/src/utils/http';
import type { ProtocolStage } from '@/src/templates/protocols/types';

export const getStagesByProtocolId = async (protocolId: string): Promise<ProtocolStage[]> => {
  return apiRequest<ProtocolStage[]>(`/api/protocols/${protocolId}/stages`);
};

export const getStagesByTemplateId = async (templateId: string): Promise<ProtocolStage[]> => {
  return apiRequest<ProtocolStage[]>(`/api/templates/${templateId}/stages`);
};

export const createStage = async (protocolId: string, stageData: Omit<ProtocolStage, 'id'>): Promise<ProtocolStage> => {
  return apiRequest<ProtocolStage>(`/api/protocols/${protocolId}/stages`, { 
    method: 'POST',
    body: stageData,
  });
};

export const updateStage = async (stageId: string, stageData: Partial<ProtocolStage>): Promise<ProtocolStage> => {
  return apiRequest<ProtocolStage>(`/api/stages/${stageId}`, {
    method: 'PUT',
    body: stageData,
  });
};

export const deleteStage = async (stageId: string): Promise<void> => {
  return apiRequest<void>(`/api/stages/${stageId}`, {
    method: 'DELETE',
  });
};

export const reorderStages = async (protocolId: string, stageIds: string[]): Promise<ProtocolStage[]> => {
  return apiRequest<ProtocolStage[]>(`/api/protocols/${protocolId}/stages/reorder`, {
    method: 'PUT',
    body: { stageIds },
  });
};