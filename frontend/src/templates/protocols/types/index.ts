import { 
  Client, 
  User
} from "@/src/lib/api";

export interface ProtocolStage {
  id: string;
  protocolId: string;
  name: string;
  value: number;
  intervalDays: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateStage {
  id: string;
  name: string;
  value: number;
  intervalDays: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Protocol {
  id: string;
  title: string;
  clientId?: string;
  createdBy: string;
  isTemplate: boolean;
  stages?: ProtocolStage[];
  createdAt: string;
  updatedAt: string;
  stage?: number;
  client?: Client;
  creator?: User;
}

export interface ProtocolTemplate {
  id: string;
  title: string;
  createdBy: string;
  stages?: TemplateStage[];
  createdAt: string;
  updatedAt: string;
  stage?: number;
  creator?: User;
}

export interface CreateProtocolRequest {
  title: string;
  clientId?: string;
  stages?: Omit<ProtocolStage, 'id' | 'protocolId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateProtocolRequest extends Partial<CreateProtocolRequest> {}

export interface CreateTemplateRequest {
  title: string;
  stages?: Omit<TemplateStage, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

export interface TemplateFormData {
  title: string;
  stages: TemplateStage[];
}

export type TemplateStageFormData = TemplateStage;

export interface ProtocolsPaginatedResponse {
  rows: Protocol[];
  count: number;
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  itemsPerPage?: number;
}

export interface ProtocolSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  isTemplate?: boolean;
  createdBy?: string;
  clientId?: string;
  status?: string;
}

export interface Kit {
  id: string;
  name: string;
}