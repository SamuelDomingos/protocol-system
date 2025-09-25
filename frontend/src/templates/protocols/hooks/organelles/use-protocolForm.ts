import { useState, useEffect, useCallback } from "react";
import { ProtocolFormService} from "@/src/templates/protocols/services/organelles/protocolForm.service";
import { TemplatesService } from "@/src/templates/protocols/services/molecules/templates.service";
import { stageService } from "@/src/templates/protocols/services/molecules/stages.service";
import { useStage } from "@/src/templates/protocols/hooks/molecules/use-stage";
import { toast } from "@/src/hooks/use-toast";
import type { CreateProtocolRequest, Protocol } from "../../types";


interface UseProtocolFormOptions {
  onSuccess?: () => void;
}

export function useProtocolForm(
  initialProtocol?: Protocol,
  options?: UseProtocolFormOptions
) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialProtocol?.title || "");
  const [clientId, setClientId] = useState<string | undefined>(initialProtocol?.clientId);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined); 
  const stageOperations = useStage();
  const stagesApi = stageService();

  useEffect(() => {
    if (initialProtocol?.id) {
      loadProtocol(initialProtocol.id);
    }
  }, [initialProtocol?.id]);

  const loadProtocol = async (id: string) => {
    try {
      setIsLoading(true);
      
      const protocol = await ProtocolFormService.loadProtocol(id);

      if (protocol) {
        setTitle(protocol.title || '');
        setClientId(protocol.clientId);
        stageOperations.setStagesData(protocol.stages || []);
      }
      
    } catch (error) {
      console.error('Erro ao carregar protocolo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o protocolo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProtocol = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const protocolToSave: CreateProtocolRequest = {
        title,
        clientId: clientId,
        stages: stageOperations.stages.map(stage => ({
          name: stage.name,
          value: stage.value,
          intervalDays: stage.intervalDays,
          order: stage.order,
          kitId: stage.kitId
        }))
      };

      const savedProtocol = await ProtocolFormService.saveProtocol(
        protocolToSave,
        initialProtocol?.id
      );
      
      if (savedProtocol) {
        toast({
          title: "Sucesso",
          description: initialProtocol?.id 
            ? "Protocolo atualizado com sucesso" 
            : "Protocolo criado com sucesso"
        });
        
        options?.onSuccess?.();
      }

    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error 
          ? `Erro ao salvar protocolo: ${error.message}`
          : "Não foi possível salvar o protocolo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [title, clientId, stageOperations.stages, initialProtocol?.id, options]);

  const updateClientId = useCallback((newClientId: string | undefined) => {
    setClientId(newClientId);
  }, []);

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const selectTemplate = useCallback(async (templateId: string | undefined) => {
    if (!templateId) {
      setSelectedTemplateId(undefined);
      setTitle('');
      stageOperations.setStagesData([]);
      return;
    }

    try {
      setIsLoading(true);
 
      const [template, stages] = await Promise.all([
        TemplatesService.getById(templateId),
        stagesApi.loadStagesByTemplate(templateId)
      ]);
      
      if (template) {
        setTitle(template.title || '');
        setSelectedTemplateId(templateId);
        stageOperations.setStagesData(stages);
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [stageOperations, stagesApi]);

  const calculateTotal = useCallback(() => {
    return stageOperations.getTotalValue();
  }, [stageOperations]);

  return {
    formData: {
      title,
      clientId,
      templateId: selectedTemplateId,
      stages: stageOperations.stages
    },
    isLoading,
    updateClientId,
    updateTitle,
    selectTemplate,
    addStage: stageOperations.addStage,
    updateStage: stageOperations.updateStage,
    removeStage: stageOperations.removeStage,
    reorderStages: stageOperations.reorderStages,
    saveProtocol,
    calculateTotal
  };
}