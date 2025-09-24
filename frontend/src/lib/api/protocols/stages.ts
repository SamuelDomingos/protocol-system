import { apiRequest } from '@/src/utils/http';
import type { TemplateStageExtended } from '@/src/templates/protocols/types/template-form';

export const getStagesByProtocolId = async (protocolId: string): Promise<TemplateStageExtended[]> => {
  return apiRequest<TemplateStageExtended[]>(`/api/protocols/${protocolId}/stages`);
};

export const getStagesByTemplateId = async (templateId: string): Promise<TemplateStageExtended[]> => {
  return apiRequest<TemplateStageExtended[]>(`/api/templates/${templateId}/stages`);
};

export const createStage = async (protocolId: string, stageData: Omit<TemplateStageExtended, 'id'>): Promise<TemplateStageExtended> => {
  return apiRequest<TemplateStageExtended>(`/api/protocols/${protocolId}/stages`, {
    method: 'POST',
    body: stageData,
  });
};

export const updateStage = async (stageId: string, stageData: Partial<TemplateStageExtended>): Promise<TemplateStageExtended> => {
  return apiRequest<TemplateStageExtended>(`/api/stages/${stageId}`, {
    method: 'PUT',
    body: stageData,
  });
};

export const deleteStage = async (stageId: string): Promise<void> => {
  return apiRequest<void>(`/api/stages/${stageId}`, {
    method: 'DELETE',
  });
};

export const reorderStages = async (protocolId: string, stageIds: string[]): Promise<TemplateStageExtended[]> => {
  return apiRequest<TemplateStageExtended[]>(`/api/protocols/${protocolId}/stages/reorder`, {
    method: 'PUT',
    body: { stageIds },
  });
};