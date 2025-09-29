
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface PaginationRequestParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

export interface PaginationOptions {
  initialPage?: number
  initialItemsPerPage?: number
  itemsPerPageOptions?: number[]
  syncWithUrl?: boolean
}

export interface UsePaginationReturn {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean

  startItem: number
  endItem: number
  isEmpty: boolean

  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  setItemsPerPage: (itemsPerPage: number) => void

  getRequestParams: () => PaginationRequestParams
  updateFromResponse: (response: PaginatedResponse<any>) => void
}