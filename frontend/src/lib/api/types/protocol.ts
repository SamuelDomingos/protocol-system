export interface Protocol {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  clientName: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  stages: ProtocolStage[];
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  completed: boolean;
  value: number;
}

export interface CreateProtocolRequest {
  name: string;
  description?: string;
  clientId: string;
  templateId?: string;
  stages: Omit<ProtocolStage, 'id' | 'completed'>[];
}

export interface UpdateProtocolRequest extends Partial<CreateProtocolRequest> {
  status?: Protocol['status'];
}