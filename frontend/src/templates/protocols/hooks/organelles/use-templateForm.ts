import { useState, useEffect, useCallback } from "react";
import {
  getTemplateById,
  createTemplate,
  updateTemplate,
  getStagesByTemplateId,
} from "@/src/lib/api/protocols";
import { useStage } from "@/src/templates/protocols/hooks/molecules/use-stage";
import type { ProtocolFormData } from "@/src/templates/protocols/types";
import { useFeedbackHandler } from "@/src/hooks/useFeedbackHandler";

interface UseTemplateFormOptions {
  onSuccess?: () => void;
}

export function useTemplateForm(
  templateId?: string,
  options?: UseTemplateFormOptions
) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const { handleError, handleSuccess } = useFeedbackHandler();

  const stageOperations = useStage();

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    try {
      setIsLoading(true);

      const [template, stages] = await Promise.all([
        getTemplateById(id),
        getStagesByTemplateId(id),
      ]);

      if (template) {
        setTitle(template.title || "");
      }

      stageOperations.setStagesData(stages);
    } catch (error) {
      console.error("Erro ao carregar template:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!title.trim()) {
        handleError({ message: "O título do template é obrigatório" });
        return;
      }

      const requestData: ProtocolFormData = {
        title: title,
        stages: stageOperations.stages,
      };

      let result;
      if (templateId) {
        result = await updateTemplate(templateId, requestData);
      } else {
        result = await createTemplate(requestData);
      }

      if (result) {
        handleSuccess(
          templateId
            ? "Template atualizado com sucesso"
            : "Template criado com sucesso"
        );
        options?.onSuccess?.();
      }
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [title, stageOperations.stages, templateId, options]);

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const calculateTotal = useCallback(() => {
    return stageOperations.getTotalValue();
  }, [stageOperations]);

  return {
    formData: {
      title,
      stages: stageOperations.stages,
    },
    isLoading,
    updateTitle,
    addStage: stageOperations.addStage,
    updateStage: stageOperations.updateStage,
    removeStage: stageOperations.removeStage,
    reorderStages: stageOperations.reorderStages,
    saveTemplate,
    calculateTotal,
  };
}
