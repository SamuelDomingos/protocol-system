import { createTemplate, updateTemplate, getTemplateById } from "@/src/lib/api/protocols";
import { getStagesByTemplateId, createStage, updateStage, deleteStage, reorderStages } from "@/src/lib/api/protocols/stages";
import { TemplateFormData, ProtocolExtended, TemplateStageExtended } from "../types/template-form";

export class TemplateFormService {
  static async getTemplateWithStages(id: string): Promise<TemplateFormData> {
    const template = await getTemplateById(id) as unknown as ProtocolExtended;
    const stages = await getStagesByTemplateId(id) as unknown as TemplateStageExtended[];
    
    return {
      title: template.title,
      stages: stages.map((stage, index) => ({
        id: stage.id,
        name: stage.name,
        order: stage.order || index + 1,
        value: stage.defaultValue || 0,
        intervalDays: stage.intervalDays || 0,
        kitId: stage.kitId
      }))
    };
  }

  static async saveTemplate(data: TemplateFormData, id?: string): Promise<any> {

    const templatePayload = {
      title: data.title,
    };

    let template;
    if (id) {
      template = await updateTemplate(id, templatePayload as any);
    } else {
      template = await createTemplate(templatePayload as any);
    }

    const templateId = template.id;
    const existingStages = id ? await getStagesByTemplateId(templateId) as unknown as TemplateStageExtended[] : [];

    const stagePromises = data.stages.map(async (stage, index) => {
      const stageData = {
        name: stage.name,
        order: index + 1,
        defaultValue: stage.value,
        intervalDays: stage.intervalDays,
        kitId: stage.kitId
      };

      if (stage.id) {
        return updateStage(stage.id, stageData);
      } else {
        return createStage(templateId, stageData);
      }
    });

    const currentStageIds = data.stages.filter(s => s.id).map(s => s.id);
    const stagesToDelete = existingStages.filter(s => !currentStageIds.includes(s.id));
    
    const deletePromises = stagesToDelete.map(stage => deleteStage(stage.id));

    await Promise.all([...stagePromises, ...deletePromises]);

    if (data.stages.length > 1 && data.stages.some(s => s.id)) {
      const stageIds = (await getStagesByTemplateId(templateId) as unknown as TemplateStageExtended[]).map(s => s.id);
      await reorderStages(templateId, stageIds);
    }
    
    return template;
  }
}
