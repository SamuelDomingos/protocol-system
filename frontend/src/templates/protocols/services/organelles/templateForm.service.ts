import { TemplatesService } from '../molecules/templates.service';
import type { ProtocolFormData, ProtocolStageFormData } from '@/src/templates/protocols/types';
import { toast } from '@/src/hooks/use-toast';

export class TemplateFormService {
  static async loadTemplate(templateId: string): Promise<ProtocolFormData | null> {
    try {
      const template = await TemplatesService.getById(templateId);
      
      return {
        title: template.title,
        clientId: template.clientId,
        stages: template.stages || []
      };
      
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      return null;
    }
  }

  static async saveTemplate(
    templateData: { title: string }, 
    stages: ProtocolStageFormData[] = [],
    templateId?: string
  ): Promise<{ id: string } | null> {
    try {

      const requestData = {
        title: templateData.title,
        stages: stages
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
