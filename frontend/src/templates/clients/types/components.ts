import { Client } from './client';

// Tipos para componentes de tabela de clientes
export interface ClientsTableProps {
  onEditClient?: (client: import('./client').Client) => void;
  onViewClient?: (client: import('./client').Client) => void;
  onDeleteClient?: (client: import('./client').Client) => void;
}

export interface ClientsPageProps {
  className?: string;
}

export interface ClientActionHandlers {
  onCreateClient?: () => void;
  onEditClient?: (client: import('./client').Client) => void;
  onViewClient?: (client: import('./client').Client) => void;
  onDeleteClient?: (client: import('./client').Client) => void;
}


export interface ClientsTableProps {
  data: Client[];
  isLoading: boolean;
  error: string | null;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
}

