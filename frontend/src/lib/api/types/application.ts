export interface Application {
  id: string;
  stageId: string;
  nurseId: string;
  appliedAt: string;
  clientPhoto?: string;
  clientSignature: string;
  nurseSignature: string;
  status: 'applied' | 'completed' | 'cancelled';
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  nurse?: {
    id: string;
    name: string;
    role: string;
  };
  stage?: {
    id: string;
    name: string;
    order: number;
    protocolId: string;
    protocol?: {
      id: string;
      title: string;
    };
  };
}

export interface CreateApplicationRequest {
  stageId: string;
  appliedAt: string;
  clientSignature: string;
  nurseSignature: string;
  clientPhoto?: string;
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {
  status?: Application['status'];
  completedAt?: string;
  completedBy?: string;
}

export interface ApplicationsResponse {
  applications: Application[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}