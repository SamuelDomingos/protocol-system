import { useState, useEffect, useCallback } from "react";
import {
  getProtocolById,
  createProtocol,
  updateProtocol,
  getTemplateById,
  getStagesByTemplateId,
} from "@/src/lib/api/protocols";
import { useStage } from "@/src/templates/protocols/hooks/molecules/use-stage";
import type {
  CreateProtocolRequest,
  Protocol,
  UpdateProtocolRequest,
} from "@/src/templates/protocols/types";
import { useFeedbackHandler } from "@/src/hooks/useFeedbackHandler";

interface UseProtocolFormOptions {
  onSuccess?: () => void;
}

export function useProtocolForm(
  initialProtocol?: Protocol,
  options?: UseProtocolFormOptions
) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialProtocol?.title || "");
  const [clientId, setClientId] = useState<string | undefined>(
    initialProtocol?.clientId
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >(undefined);
  const stageOperations = useStage();
  const { handleError, handleSuccess } = useFeedbackHandler();

  useEffect(() => {
    if (initialProtocol?.id) {
      loadProtocol(initialProtocol.id);
    }
  }, [initialProtocol?.id]);

  const loadProtocol = async (id: string) => {
    try {
      setIsLoading(true);

      const protocol = await getProtocolById(id);

      if (protocol) {
        setTitle(protocol.title || "");
        setClientId(protocol.clientId);
        stageOperations.setStagesData(protocol.stages || []);
      }
    } catch (error) {
      console.error("Erro ao carregar protocolo:", error);
      handleError(error);
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
        stages: stageOperations.stages.map((stage) => ({
          name: stage.name,
          value: stage.value,
          intervalDays: stage.intervalDays,
          order: stage.order,
          // kitId: stage.kitId
        })),
      };

      const savedProtocol = initialProtocol?.id
        ? await updateProtocol(
            initialProtocol.id,
            protocolToSave as UpdateProtocolRequest
          )
        : await createProtocol(protocolToSave);

      if (savedProtocol) {
        handleSuccess(
          initialProtocol?.id
            ? "Protocolo atualizado com sucesso"
            : "Protocolo criado com sucesso"
        );
        options?.onSuccess?.();
      }
    } catch (error) {
      handleError(error);
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

  const selectTemplate = useCallback(
    async (templateId: string | undefined) => {
      if (!templateId) {
        setSelectedTemplateId(undefined);
        setTitle("");
        stageOperations.setStagesData([]);
        return;
      }

      try {
        setIsLoading(true);

        const [template, stages] = await Promise.all([
          getTemplateById(templateId),
          getStagesByTemplateId(templateId),
        ]);

        if (template) {
          setTitle(template.title || "");
          setSelectedTemplateId(templateId);
          stageOperations.setStagesData(stages);
        }
      } catch (error) {
        console.error("Erro ao carregar template:", error);
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [stageOperations]
  );

  const calculateTotal = useCallback(() => {
    return stageOperations.getTotalValue();
  }, [stageOperations]);

  return {
    formData: {
      title,
      clientId,
      templateId: selectedTemplateId,
      stages: stageOperations.stages,
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
    calculateTotal,
  };
}
