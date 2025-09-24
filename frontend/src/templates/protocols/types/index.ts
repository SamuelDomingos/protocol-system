// Importando tipos da API como fonte única da verdade
export type {
  Protocol as APIProtocol,
  ProtocolStage as APIProtocolStage,
  CreateProtocolRequest as APICreateProtocolRequest,
  UpdateProtocolRequest as APIUpdateProtocolRequest,
} from "@/src/lib/api/types/protocol";

// Tipos compartilhados alinhados com a API
export interface ProtocolStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  completed: boolean;
  value: number;
}

export interface TemplateStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  defaultValue: number;
  intervalDays?: number;
  kitId?: string;
}

// Tipos de Protocolo alinhados com a API
export interface Protocol {
  id: string;
  title: string; // Mantendo title para compatibilidade com template
  name?: string; // Adicionando name da API
  description?: string;
  clientId: string;
  clientName: string;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  stages: ProtocolStage[];
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProtocolRequest {
  title: string;
  name?: string;
  description?: string;
  clientId: string;
  templateId?: string;
  stages?: Omit<ProtocolStage, 'id' | 'completed'>[];
}

export interface UpdateProtocolRequest extends Partial<CreateProtocolRequest> {
  status?: Protocol['status'];
}

// Tipos de Template
export interface ProtocolTemplate {
  id: string;
  title: string;
  description?: string;
  stages?: TemplateStage[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTemplateRequest {
  title: string;
  description?: string;
  stages?: Omit<TemplateStage, 'id'>[];
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}