import { TemplateStage } from "./index";

export interface TemplateFormData {
  title: string;
  stages: TemplateStageFormData[];
}

export interface TemplateStageFormData {
  id?: string;
  name: string;
  order: number;
  value: number;
  intervalDays: number;
  kitId?: string;
}

export interface Kit {
  id: string;
  name: string;
}

// Interface estendida para compatibilidade com a API
export interface TemplateStageExtended extends TemplateStage {
  intervalDays?: number;
  kitId?: string;
  defaultValue?: number;
}

// Interface estendida para compatibilidade com a API
export interface ProtocolExtended {
  id: string;
  title: string;
  stages?: TemplateStageExtended[];
}
