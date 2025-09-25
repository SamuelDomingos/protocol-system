import { useState, useEffect, useCallback } from "react";
import { ProtocolFormService, type ProtocolStageFormData } from "../services/protocolForm.service";
import { TemplatesService } from "../services/templates.service";
import { useStage } from "./use-stage";
import { toast } from "@/src/hooks/use-toast";
import type { CreateProtocolRequest } from "../types";

interface UseProtocolFormOptions {
  onSuccess?: () => void;
}

export function useProtocolForm(
  protocolId?: string, 
  templateId?: string,
  options?: UseProtocolFormOptions
) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string | undefined>();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(templateId);
  const stageOperations = useStage();

  useEffect(() => {
    if (protocolId) {
      loadProtocol(protocolId);
    } else if (templateId) {
      selectTemplate(templateId);
    }
  }, [protocolId, templateId]);

  const loadProtocol = async (id: string) => {
    try {
      setIsLoading(true);
      
      const protocol = await ProtocolFormService.loadProtocol(id);
      
      if (protocol) {
        setTitle(protocol.title || '');
        setClientId(protocol.clientId);
        stageOperations.setStagesData(protocol.stages);
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

      const protocol = await ProtocolFormService.saveProtocol(
        { title, clientId }, 
        stageOperations.stages, 
        protocolId
      );
      
      if (protocol) {
        toast({
          title: "Sucesso",
          description: protocolId 
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
  }, [title, clientId, stageOperations.stages, protocolId, options]);

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const updateClientId = useCallback((newClientId: string | undefined) => {
    setClientId(newClientId);
  }, []);

  const selectTemplate = useCallback(async (templateId: string | undefined) => {
    if (templateId) {
      try {
        setIsLoading(true);
        const template = await TemplatesService.getById(templateId);
        
        if (template) {
          setTitle(template.title || '');
          setSelectedTemplateId(templateId);
          stageOperations.setStagesData(template.stages || []);
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
    } else {
      setSelectedTemplateId(undefined);
      setTitle('');
      stageOperations.setStagesData([]);
    }
  }, [stageOperations]);

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
    updateTitle,
    updateClientId,
    selectTemplate,
    addStage: stageOperations.addStage,
    updateStage: stageOperations.updateStage,
    removeStage: stageOperations.removeStage,
    reorderStages: stageOperations.reorderStages,
    saveProtocol,
    calculateTotal
  };
}