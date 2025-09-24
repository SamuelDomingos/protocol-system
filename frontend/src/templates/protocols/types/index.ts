// Tipos compartilhados
export interface ProtocolStage {
  id: string;
  name: string;
  order: number;
  completed: boolean;
  value: number;
}

export interface TemplateStage {
  id: string;
  name: string;
  order: number;
  defaultValue: number;
}

// Tipos de Protocolo
export interface Protocol {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  stages: ProtocolStage[];
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProtocolRequest {
  title: string;
  clientId: string;
  templateId?: string;
  stages: Omit<ProtocolStage, 'id' | 'completed'>[];
}

// Tipos de Template
export interface ProtocolTemplate {
  id: string;
  title: string;
  stages: TemplateStage[];
  createdAt: string;
}

export interface CreateTemplateRequest {
  title: string;  
  stages: Omit<TemplateStage, 'id'>[];
}