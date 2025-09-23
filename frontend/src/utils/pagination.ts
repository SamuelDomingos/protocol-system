export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startItem: number
  endItem: number
}

export function calculatePaginationInfo(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
    startItem,
    endItem,
  }
}

export function validatePaginationParams(page: number, limit: number) {
  const validatedPage = Math.max(1, page)
  const validatedLimit = Math.max(1, Math.min(100, limit)) // Max 100 items per page

  return {
    page: validatedPage,
    limit: validatedLimit,
  }
}

export function buildPaginationQuery(page: number, limit: number, search?: string) {
  const params = new URLSearchParams()
  
  params.set('page', page.toString())
  params.set('limit', limit.toString())
  
  if (search && search.trim()) {
    params.set('search', search.trim())
  }

  return params.toString()
}