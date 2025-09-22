// src/hooks/use-pagination.ts
import { useState, useEffect } from "react"

interface UsePaginationProps<T> {
  items: T[]
  itemsPerPage?: number
  initialPage?: number
  onPageChange?: (page: number) => void
}

export function usePagination<T>({
  items,
  itemsPerPage = 20,
  initialPage = 1,
  onPageChange,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const totalPages = Math.ceil(items.length / itemsPerPage)

  // Resetar para a primeira página quando os itens mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  // Obter os itens para a página atual
  const paginatedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }

  // Função para mudar a página atual
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      if (onPageChange) {
        onPageChange(page)
      }
    }
  }

  return {
    currentPage,
    totalPages,
    goToPage,
    paginatedItems: paginatedItems(), // Aqui calcula os itens da página atual
    totalItems: items.length,
    itemsPerPage,
  }
}