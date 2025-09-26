import {
  Client
} from "@/src/templates/clients";
import {
  User
} from "@/src/lib/api/types";

export interface BaseStage {
  id: string;
  name: string;
  value: number;
  intervalDays: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProtocolStage extends BaseStage {
  protocolId: string;
}

export interface Protocol {
  id: string;
  title: string;
  clientId?: string;
  clientName?: string;
  createdBy: string;
  isTemplate: boolean;
  stages?: ProtocolStage[];
  totalValue?: number;
  createdAt: string;
  updatedAt: string;
  stage?: number;
  client?: Client;
  creator?: User;
}

export type StageRequest = Omit<BaseStage, 'id' | 'createdAt' | 'updatedAt'>;

export interface CreateProtocolRequest {
  title: string;
  clientId?: string;
  clientName?: string;
  isTemplate?: boolean;
  stages?: StageRequest[];
}

export interface UpdateProtocolRequest extends Partial<CreateProtocolRequest> { }

export interface ProtocolFormData {
  title: string;
  clientId?: string;
  stages: StageRequest[];
}

export type ProtocolStageFormData = StageRequest;

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

export interface SortableStagesListProps {
  stages: ProtocolStageFormData[];
  updateStage: (index: number, data: Partial<ProtocolStageFormData>) => void;
  removeStage: (index: number) => void;
  reorderStages: (oldIndex: number, newIndex: number) => void;
  addStage: () => void;
  calculateTotal: () => number;
  mockKits: Kit[];
  showKitSelection?: boolean;
  isProtocol?: boolean;
  showTotal?: boolean;
  title?: string;
}

export interface SortableStageProps {
  stage: ProtocolStageFormData;
  index: number;
  updateStage: (index: number, data: Partial<ProtocolStageFormData>) => void;
  removeStage: (index: number) => void;
  mockKits: Kit[];
  showKitSelection?: boolean;
  isProtocol?: boolean;
}
