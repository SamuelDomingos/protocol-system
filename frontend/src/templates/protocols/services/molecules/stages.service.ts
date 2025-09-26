import { useState } from 'react';
import { useToast } from '@/src/components/ui/use-toast';
import { 
  getStagesByTemplateId,
  createStage,
  updateStage,
  deleteStage,
  reorderStages
} from '@/src/lib/api/protocols';
import { ProtocolStageFormData } from '@/src/templates/protocols/types';

export function stageService() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadStagesByTemplate = async (templateId: string): Promise<ProtocolStageFormData[]> => {  
    try {
      setIsLoading(true);
      const stages = await getStagesByTemplateId(templateId);

      return stages;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estágios",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createNewStage = async (templateId: string, stageData: Omit<ProtocolStageFormData, 'id'>): Promise<ProtocolStageFormData | null> => {
    try {
      return await createStage(templateId, stageData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o estágio",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateExistingStage = async (stageId: string, stageData: Partial<ProtocolStageFormData>): Promise<ProtocolStageFormData | null> => {
    try {
      return await updateStage(stageId, stageData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estágio",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteExistingStage = async (stageId: string): Promise<boolean> => {
    try {
      await deleteStage(stageId);
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o estágio",
        variant: "destructive"
      });
      return false;
    }
  };

  const reorderExistingStages = async (templateId: string, stageIds: string[]): Promise<boolean> => {
    try {
      await reorderStages(templateId, stageIds);
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os estágios",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isLoading,
    loadStagesByTemplate,
    createNewStage,
    updateExistingStage,
    deleteExistingStage,
    reorderExistingStages
  };
}