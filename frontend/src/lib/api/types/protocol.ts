export interface Protocol {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProtocolRequest {
  title: string;
  description: string;
  status?: 'draft' | 'active';
}

export interface UpdateProtocolRequest extends Partial<CreateProtocolRequest> {}