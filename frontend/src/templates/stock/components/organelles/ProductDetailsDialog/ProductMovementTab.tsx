"use client"

import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/src/components/ui/table"
import { ArrowUp, ArrowDown, ArrowLeftRight } from "lucide-react"
import { StockMovement } from '@/src/lib/api/types/stock'
import { formatDate } from '@/src/lib/utils'
import { PaginationControls, UsePaginationReturn } from '@/src/global/pagination'

interface ProductMovementTabProps {
  movements: StockMovement[]
  loading?: boolean
  pagination: UsePaginationReturn
}

export function ProductMovementTab({ movements, loading, pagination }: ProductMovementTabProps) {
  const getOriginDisplay = (movement: StockMovement) => {
    if (movement.type === 'entrada') {
      return movement.fromLocation?.name || 'N/A'
    }
    if (movement.type === 'saida') {
      return movement.fromLocation?.name || 'Estoque'
    }
    if (movement.type === 'transferencia') {
      return movement.fromLocation?.name || 'N/A'
    }
    return 'N/A'
  }

  const getDestinationDisplay = (movement: StockMovement) => {
    if (movement.type === 'entrada') {
      return movement.toLocation?.name || 'Estoque'
    }
    if (movement.type === 'saida') {
      return movement.toLocation?.name || 'N/A'
    }
    if (movement.type === 'transferencia') {
      return movement.toLocation?.name || 'N/A'
    }
    return 'N/A'
  }

  const getOperationTypeDisplay = (type: string) => {
    if (type === "entrada") {
      return (
        <div className="flex items-center gap-1">
          <ArrowUp className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Entrada</span>
        </div>
      )
    } else if (type === "saida") {
      return (
        <div className="flex items-center gap-1">
          <ArrowDown className="h-4 w-4 text-red-500" />
          <span className="text-red-500">Saída</span>
        </div>
      )
    } else if (type === "transferencia") {
      return (
        <div className="flex items-center gap-1">
          <ArrowLeftRight className="h-4 w-4 text-blue-500" />
          <span className="text-blue-500">Transferência</span>
        </div>
      )
    }
    return type
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-sm text-muted-foreground">Carregando movimentações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Histórico de Movimentações</h4>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Quant.</TableHead>
              <TableHead>Tipo de Operação</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Usuário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length > 0 ? (
              movements.map(movement => (
                <TableRow key={movement.id}>
                  <TableCell>{formatDate(movement.createdAt)}</TableCell>
                  <TableCell>{movement.reason || movement.notes || 'N/A'}</TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{getOperationTypeDisplay(movement.type)}</TableCell>
                  <TableCell>{getOriginDisplay(movement)}</TableCell>
                  <TableCell>{getDestinationDisplay(movement)}</TableCell>
                  <TableCell>{movement.user?.name || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhuma movimentação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls 
        pagination={pagination}
        showItemsPerPage={true}
        itemsPerPageOptions={[5, 10, 20, 50]}
      />
    </div>
  )
}

export default ProductMovementTab