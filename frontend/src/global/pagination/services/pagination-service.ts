import { PaginationInfo } from '../types/pagination'

export class PaginationService {
  static readonly DEFAULT_PAGE = 1
  static readonly DEFAULT_ITEMS_PER_PAGE = 10
  static readonly DEFAULT_OPTIONS = [10, 20, 50, 100]

  static calculateDisplayInfo(currentPage: number, itemsPerPage: number, totalItems: number): {
    startItem: number,
    endItem: number,
    isEmpty: boolean
  } {
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)
    const isEmpty = totalItems === 0

    return { startItem, endItem, isEmpty }
  }

  static generatePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
  ): (number | 'ellipsis')[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = []
    const sidePages = Math.floor((maxVisible - 3) / 2)

    pages.push(1)

    let startPage = Math.max(2, currentPage - sidePages)
    let endPage = Math.min(totalPages - 1, currentPage + sidePages)

    if (currentPage <= sidePages + 2) {
      endPage = Math.min(totalPages - 1, maxVisible - 1)
    }
    if (currentPage >= totalPages - sidePages - 1) {
      startPage = Math.max(2, totalPages - maxVisible + 2)
    }

    if (startPage > 2) {
      pages.push('ellipsis')
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages - 1) {
      pages.push('ellipsis')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  static parseFromURL(searchParams: URLSearchParams): {
    page: number,
    limit: number
  } {
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    
    return {
      page: isNaN(page) ? this.DEFAULT_PAGE : Math.max(1, page),
      limit: isNaN(limit) ? this.DEFAULT_ITEMS_PER_PAGE : Math.max(1, limit)
    }
  }
}