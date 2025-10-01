import { Application, CreateApplicationRequest, UpdateApplicationRequest } from '@/src/lib/api/types/application';

// Props para o componente de lista de applications
export interface ApplicationListProps {
  applications: Application[];
  onEdit?: (application: Application) => void;
  onDelete?: (id: string) => void;
  onView?: (application: Application) => void;
  loading?: boolean;
}

// Props para o componente de lista de pacientes
export interface ApplicationPatientsListProps {
  applications: Application[];
  onSelectApplication?: (application: Application) => void;
  selectedApplicationId?: string;
  loading?: boolean;
}

// Props para o formulário de application
export interface ApplicationFormProps {
  application?: Application;
  onSubmit: (data: CreateApplicationRequest | UpdateApplicationRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
  isEditing?: boolean;
}

// Props para o componente principal
export interface ApplicationsTemplateProps {
  initialApplications?: Application[];
  onApplicationCreated?: (application: Application) => void;
  onApplicationUpdated?: (application: Application) => void;
  onApplicationDeleted?: (id: string) => void;
}

// Estados do formulário
export interface ApplicationFormData {
  stageId: string;
  appliedAt?: Date;
  clientPhoto?: File;
  clientSignature?: File;
  nurseSignature?: File;
  status?: 'applied' | 'completed' | 'cancelled';
}

// Filtros para busca
export interface ApplicationFilters {
  stageId?: string;
  nurseId?: string;
  status?: 'applied' | 'completed' | 'cancelled';
  dateFrom?: Date;
  dateTo?: Date;
}