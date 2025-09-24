// Informações de paginação vindas do backend
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Resposta paginada do backend
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// Parâmetros para requisições de paginação
export interface PaginationRequestParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

// Configurações do hook de paginação
export interface PaginationOptions {
  initialPage?: number
  initialItemsPerPage?: number
  itemsPerPageOptions?: number[]
  syncWithUrl?: boolean
}

// Interface do hook usePagination
export interface UsePaginationReturn {
  // Estado atual
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  
  // Informações calculadas
  startItem: number
  endItem: number
  isEmpty: boolean
  
  // Ações
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  setItemsPerPage: (itemsPerPage: number) => void
  
  // Utilitários
  getRequestParams: () => PaginationRequestParams
  updateFromResponse: (response: PaginatedResponse<any>) => void
}