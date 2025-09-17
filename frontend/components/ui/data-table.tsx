// src/components/ui/data-table/pagination-controls.tsx
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  showSummary?: boolean
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showSummary = true,
}: PaginationControlsProps) {
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const goToPage = (pageNumber: number) => {
    onPageChange(pageNumber)
  }

  // Gerar números de página para a paginação
  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    
    // Caso simples: menos de maxVisiblePages páginas
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => goToPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
      return items
    }
    
    // Caso complexo: muitas páginas, mostrar elipses
    // Sempre mostrar primeira página
    items.push(
      <PaginationItem key={1}>
        <PaginationLink 
          onClick={() => goToPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Determinar início e fim das páginas visíveis
    let startPage = Math.max(2, currentPage - 1)
    let endPage = Math.min(startPage + 2, totalPages - 1)
    
    // Ajustar para sempre mostrar 3 números (se possível)
    if (endPage - startPage < 2) {
      startPage = Math.max(2, endPage - 2)
    }
    
    // Elipse no início se necessário
    if (startPage > 2) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => goToPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Elipse no final se necessário
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Sempre mostrar última página
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            onClick={() => goToPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return items
  }

  // Calcular o intervalo atual de itens exibidos
  const startItem = Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)
  const endItem = Math.min(totalItems, currentPage * itemsPerPage)

  if (totalPages <= 0) return null

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={goToPreviousPage} 
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {renderPaginationItems()}
          
          <PaginationItem>
            <PaginationNext 
              onClick={goToNextPage} 
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      {showSummary && totalItems > 0 && (
        <div className="text-sm text-muted-foreground">
          Mostrando {startItem} a {endItem} de {totalItems} itens
        </div>
      )}
    </div>
  )
}

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
    paginatedItems: paginatedItems(),
    totalItems: items.length,
    itemsPerPage,
  }
}