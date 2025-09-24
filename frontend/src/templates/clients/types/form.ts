// Tipos para formulários de clientes
export interface ClientFormData {
  name: string;
  phone?: string;
  cpf?: string;
  observation?: string;
}

export interface ClientFormProps {
  client?: import('./client').Client;
  onSuccess?: (client: import('./client').Client) => void;
  onCancel?: () => void;
}

export interface UseClientFormProps {
  client?: import('./client').Client;
  onSuccess?: (client: import('./client').Client) => void;
  onCancel?: () => void;
}

export interface UseClientFormReturn {
  form: import('react-hook-form').UseFormReturn<ClientFormData>;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: ClientFormData) => Promise<void>;
  isEditing: boolean;
}
