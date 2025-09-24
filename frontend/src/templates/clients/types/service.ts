// Tipos para serviços de clientes
export interface ClientsServiceMethods {
  fetchClients: (params?: import('./client').ClientSearchParams) => Promise<import('./client').ClientsPaginatedResponse>;
  searchClients: (searchTerm: string) => Promise<import('./client').Client[]>;
  createClient: (data: import('./client').CreateClientRequest) => Promise<import('./client').Client>;
  updateClient: (id: number, data: import('./client').UpdateClientRequest) => Promise<import('./client').Client>;
  validatePaginationParams: (params?: import('./client').ClientSearchParams) => import('./client').ClientSearchParams | undefined;
  buildSearchParamsFromUrl: (urlParams: URLSearchParams) => import('./client').ClientSearchParams;
  shouldUseSearch: (searchTerm: string) => boolean;
  formatPaginationInfo: (pagination: import('./client').ClientsPaginatedResponse['pagination']) => string;
}

export interface ClientServiceError {
  message: string;
  code?: string;
  details?: unknown;
}
