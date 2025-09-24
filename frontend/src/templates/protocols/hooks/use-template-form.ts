import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TemplateFormData, TemplateStageFormData } from "../types/template-form";
import { TemplateFormService } from "../services/template-form-service";
import { toast } from "@/src/components/ui/use-toast";

export function useTemplateForm(templateId?: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    title: "",
    stages: []
  });

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await TemplateFormService.getTemplateWithStages(id);
      setFormData(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTitle = (title: string) => {
    setFormData(prev => ({ ...prev, title }));
  };

  const addStage = () => {
    const newStage: TemplateStageFormData = {
      name: "",
      order: formData.stages.length + 1,
      value: 0,
      intervalDays: 0
    };
    
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }));
  };

  const updateStage = (index: number, data: Partial<TemplateStageFormData>) => {
    setFormData(prev => {
      const stages = [...prev.stages];
      stages[index] = { ...stages[index], ...data };
      return { ...prev, stages };
    });
  };

  const removeStage = (index: number) => {
    setFormData(prev => {
      const stages = prev.stages.filter((_, i) => i !== index);

      const reorderedStages = stages.map((stage, idx) => ({
        ...stage,
        order: idx + 1
      }));
      return { ...prev, stages: reorderedStages };
    });
  };

  const reorderStages = (startIndex: number, endIndex: number) => {
    setFormData(prev => {
      const stages = [...prev.stages];
      const [removed] = stages.splice(startIndex, 1);
      stages.splice(endIndex, 0, removed);

      const reorderedStages = stages.map((stage, idx) => ({
        ...stage,
        order: idx + 1
      }));
      
      return { ...prev, stages: reorderedStages };
    });
  };

  const saveTemplate = async () => {
    try {
      setIsLoading(true);
      await TemplateFormService.saveTemplate(formData, templateId);
      toast({
        title: "Sucesso",
        description: templateId 
          ? "Template atualizado com sucesso" 
          : "Template criado com sucesso"
      });
      router.push("/protocols/templates");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.stages.reduce((total, stage) => total + (stage.value || 0), 0);
  };

  return {
    formData,
    isLoading,
    updateTitle,
    addStage,
    updateStage,
    removeStage,
    reorderStages,
    saveTemplate,
    calculateTotal
  };
}