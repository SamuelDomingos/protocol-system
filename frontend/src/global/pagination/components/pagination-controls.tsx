"use client"

import * as React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { PaginationService } from "@/src/global/pagination/services/pagination-service"
import { UsePaginationReturn } from "@/src/global/pagination/types/pagination"

interface PaginationControlsProps {
  pagination: UsePaginationReturn
  showItemsPerPage?: boolean
  itemsPerPageOptions?: number[]
  className?: string
  maxVisiblePages?: number
}

export function PaginationControls({
  pagination,
  showItemsPerPage = true,
  itemsPerPageOptions = PaginationService.DEFAULT_OPTIONS,
  className,
  maxVisiblePages = 5,
}: PaginationControlsProps) {
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
    isEmpty,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setItemsPerPage,
  } = pagination

  const pageNumbers = React.useMemo(
    () => PaginationService.generatePageNumbers(currentPage, totalPages, maxVisiblePages),
    [currentPage, totalPages, maxVisiblePages]
  )

  if (isEmpty || (totalPages <= 1 && !showItemsPerPage)) {
    return null
  }

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {!isEmpty && (
          <span>
            Mostrando {startItem} a {endItem} de {totalItems} resultados
          </span>
        )}
        
        {showItemsPerPage && (
          <>
            {!isEmpty && <span>•</span>}
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>por página</span>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={goToPreviousPage}
                className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {pageNumbers.map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={page === currentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={goToNextPage}
                className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}