import { useState, useEffect, useCallback } from "react";
import { TemplateFormService } from "@/src/templates/protocols/services/organelles/templateForm.service";
import { stageService } from "@/src/templates/protocols/services/molecules/stages.service";
import { useStage } from "@/src/templates/protocols/hooks/molecules/use-stage";
import { toast } from "@/src/hooks/use-toast";
import type { TemplateStageFormData } from "../../types";

interface UseTemplateFormOptions {
  onSuccess?: () => void;
}

export function useTemplateForm(templateId?: string, options?: UseTemplateFormOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  
  const stagesApi = stageService();
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
        TemplateFormService.loadTemplate(id),
        stagesApi.loadStagesByTemplate(id)
      ]);
      
      if (template) {
        setTitle(template.title || '');
      }
      
      stageOperations.setStagesData(stages);
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
  };

  const saveTemplate = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!title.trim()) {
        toast({
          title: "Erro",
          description: "O título do template é obrigatório",
          variant: "destructive"
        });
        return;
      }

      const template = await TemplateFormService.saveTemplate(
        { title }, 
        stageOperations.stages, 
        templateId
      );
      
      if (template) {
        toast({
          title: "Sucesso",
          description: templateId 
            ? "Template atualizado com sucesso" 
            : "Template criado com sucesso"
        });
        
        options?.onSuccess?.();
      }

    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setIsLoading(false);
    }
  }, [title, stageOperations.stages, templateId, stagesApi, options]);

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const calculateTotal = useCallback(() => {
    return stageOperations.getTotalValue();
  }, [stageOperations]);

  return {
    formData: {
      title,
      stages: stageOperations.stages
    },
    isLoading,
    updateTitle,
    addStage: stageOperations.addStage,
    updateStage: stageOperations.updateStage,
    removeStage: stageOperations.removeStage,
    reorderStages: stageOperations.reorderStages,
    saveTemplate,
    calculateTotal
  };
}