"use client"

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { ArrowUp, ArrowDown, User, ArrowLeftRight } from "lucide-react"
import { StockMovement } from '@/src/lib/api/types/stock'
import { formatDate } from '@/src/lib/utils'
import { PaginationControls } from '@/src/global/pagination/components/pagination-controls'
import { UsePaginationReturn } from '@/src/global/pagination/hooks/use-pagination'
import { SearchInput } from '@/src/global/search/components/search-input'
import { useSearch } from '@/src/global/search/hooks/use-search'

interface MovementsTableProps {
  movements: StockMovement[]
  isLoading?: boolean
  onRowClick?: (movement: StockMovement) => void
  pagination: UsePaginationReturn
}

export function MovementsTable({ movements, onRowClick, pagination }: MovementsTableProps) {
  const { searchTerm, setSearchTerm } = useSearch({
    onSearch: (term) => {
      console.log("Pesquisando movimentações:", term);
    }
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Pesquisar movimentações..."
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Usuário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length > 0 ? (
              movements.map((movement) => (
                <TableRow
                  key={movement.id}
                  onClick={() => onRowClick && onRowClick(movement)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  <TableCell>{formatDate(movement.createdAt || '')}</TableCell>
                  <TableCell>{movement.productName}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {movement.type === 'entrada' ? (
                        <>
                          <ArrowUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Entrada</span>
                        </>
                      ) : movement.type === 'saida' ? (
                        <>
                          <ArrowDown className="h-4 w-4 text-red-500" />
                          <span className="text-red-500">Saída</span>
                        </>
                      ) : (
                        <>
                          <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-500">Transferência</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{movement.location?.location || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{movement.user?.name || '-'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationControls pagination={pagination} />
    </div>
  )
}

export default MovementsTable