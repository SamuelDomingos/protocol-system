// Tipos para hooks de clientes
export interface UseClientsReturn {
  clients: import('./client').Client[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshClients: () => Promise<void>;
  isSearchMode: boolean;
  pagination: import('@/src/global/pagination').UsePaginationReturn;
}

export interface UseClientsParams {
  initialSearchTerm?: string;
  autoFetch?: boolean;
}
