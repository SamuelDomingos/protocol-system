import { TemplatesService } from './templates.service';
import type { TemplateFormData, TemplateStageFormData } from '../types';
import { toast } from '@/src/hooks/use-toast';

export class TemplateFormService {
  static async loadTemplate(templateId: string): Promise<TemplateFormData | null> {
    try {
      const template = await TemplatesService.getById(templateId);
      
      return {
        title: template.title,
        stages: template.stages || []
      };
      
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      return null;
    }
  }

  static async saveTemplate(
    templateData: { title: string }, 
    stages: TemplateStageFormData[] = [],
    templateId?: string
  ): Promise<{ id: string } | null> {
    try {
      const stagesToSend = stages.length > 0 ? stages.map(stage => ({
        name: stage.name,
        order: stage.order || 1,
        value: stage.value || 0,
        intervalDays: stage.intervalDays || 0,
        // kitId: stage.kitId,
      })) : [{
        name: "Estágio Inicial",
        order: 1,
        value: 0,
        intervalDays: 0
      }];

      const requestData = {
        title: templateData.title,
        stages: stagesToSend
      };

      if (templateId) {
        const updatedTemplate = await TemplatesService.update(templateId, requestData);
        return updatedTemplate;
      } else {
        const newTemplate = await TemplatesService.create(requestData);
        return newTemplate;
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro",
        description: error instanceof Error 
          ? `Erro ao salvar template: ${error.message}`
          : "Não foi possível salvar o template",
        variant: "destructive"
      });
      return null;
    }
  }
}
