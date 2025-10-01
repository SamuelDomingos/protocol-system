import { Application, CreateApplicationRequest, UpdateApplicationRequest } from '@/src/lib/api/types/application';
import { ApplicationFormData } from './components';

// Tipos para useApplication hook
export interface UseApplicationConfig {
  initialData?: Application[];
  autoFetch?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface UseApplicationReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  getApplicationById: (id: string) => Promise<Application>;
  createApplication: (data: CreateApplicationRequest) => Promise<Application>;
  createApplicationWithFile: (data: CreateApplicationRequest, files: { [key: string]: File }) => Promise<Application>;
  updateApplication: (id: string, data: UpdateApplicationRequest) => Promise<Application>;
  deleteApplication: (id: string) => Promise<void>;
  getApplicationsByStage: (stageId: string) => Promise<Application[]>;
  completeApplication: (id: string) => Promise<Application>;
}

// Tipos para useApplicationForm hook
export interface UseApplicationFormConfig {
  application?: Application;
  onSubmit?: (data: CreateApplicationRequest | UpdateApplicationRequest) => void;
  initialData?: Partial<ApplicationFormData>;
  validationRules?: Record<string, (value: any) => string | null>;
  onValidationChange?: (isValid: boolean) => void;
}

export interface UseApplicationFormReturn {
  formData: ApplicationFormData;
  errors: { [key: string]: string };
  isValid: boolean;
  handleInputChange: (field: string, value: any) => void;
  handleFileChange: (field: string, file: File | null) => void;
  handleSubmit: (onSubmit: (data: CreateApplicationRequest | UpdateApplicationRequest) => void) => void;
  resetForm: () => void;
}

// Tipos para useApplicationsTemplate hook
export interface UseApplicationsTemplateConfig {
  initialApplications?: Application[];
  onApplicationCreated?: (application: Application) => void;
  onApplicationUpdated?: (application: Application) => void;
  onApplicationDeleted?: (id: string) => void;
}

export interface UseApplicationsTemplateReturn {
  // Estados
  applications: Application[];
  loading: boolean;
  error: string | null;
  isFormDialogOpen: boolean;
  selectedApplication: Application | undefined;
  isEditing: boolean;
  activeTab: string;
  selectedApplicationId: string | undefined;
  completedApplications: Application[];
  pendingApplications: Application[];
  
  // Handlers de Dialog
  handleOpenCreateDialog: () => void;
  handleOpenEditDialog: (application: Application) => void;
  handleCloseDialog: () => void;
  
  // Handlers de Ações
  handleSubmit: (data: CreateApplicationRequest | UpdateApplicationRequest) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleView: (application: Application) => void;
  handleSelectApplication: (application: Application) => void;
  handleCompleteApplication: (id: string) => Promise<void>;
  
  // Setters
  setActiveTab: (tab: string) => void;
  setIsFormDialogOpen: (open: boolean) => void;
}

export interface UseApplicationsTemplateConfig {
  initialApplications?: Application[];
  onApplicationCreated?: (application: Application) => void;
  onApplicationUpdated?: (application: Application) => void;
  onApplicationDeleted?: (id: string) => void;
}

export interface UseApplicationsTemplateReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  isFormDialogOpen: boolean;
  selectedApplication: Application | undefined;
  isEditing: boolean;
  activeTab: string;
  selectedApplicationId: string | undefined;
  completedApplications: Application[];
  pendingApplications: Application[];
  
  // Handlers de Dialog
  handleOpenCreateDialog: () => void;
  handleOpenEditDialog: (application: Application) => void;
  handleCloseDialog: () => void;
  
  // Handlers de Ações
  handleSubmit: (data: CreateApplicationRequest | UpdateApplicationRequest) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleView: (application: Application) => void;
  handleSelectApplication: (application: Application) => void;
  handleCompleteApplication: (id: string) => Promise<void>;
  
  // Setters
  setActiveTab: (tab: string) => void;
  setIsFormDialogOpen: (open: boolean) => void;
}