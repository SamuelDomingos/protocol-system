"use client"

import React, { useMemo } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/src/components/ui/table"
import { Product, StockMovement } from '@/src/lib/api/types/stock'

interface ProductConsumptionHistoryTabProps {
  product: Product | null
  movements: StockMovement[]
}

export function ProductConsumptionHistoryTab({ product, movements }: ProductConsumptionHistoryTabProps) {
  const productMovements = useMemo(() => {
    if (!product) return []
    return movements.filter(m => m.productId === product.id)
  }, [product, movements])

  const movementsByMonth = useMemo(() => {
    const result: Record<string, { entries: number, exits: number }> = {}
    
    productMovements.forEach(movement => {
      if (!movement.createdAt) return
      
      const date = new Date(movement.createdAt)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
      
      if (!result[monthYear]) {
        result[monthYear] = { entries: 0, exits: 0 }
      }
      
      if (movement.type === 'entrada') {
        result[monthYear].entries += movement.quantity
      } else {
        result[monthYear].exits += movement.quantity
      }
    })

    return result
  }, [productMovements])

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Histórico de Consumo</h4>
      
      <div className="mb-6">
        <div className="h-64 w-full">
          {/* Aqui seria implementado o gráfico de barras */}
          <div className="flex h-full items-center justify-center border rounded-md bg-muted/20">
            <p className="text-muted-foreground">
              Gráfico de histórico de consumo será implementado aqui
            </p>
          </div>
        </div>
      </div>
      
      <h4 className="text-sm font-medium mb-2">Resumo por Período</h4>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead>Entradas</TableHead>
              <TableHead>Saídas</TableHead>
              <TableHead>Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(movementsByMonth).length > 0 ? (
              Object.entries(movementsByMonth).map(([monthYear, data]) => (
                <TableRow key={monthYear}>
                  <TableCell>{monthYear}</TableCell>
                  <TableCell className="text-green-500">{data.entries}</TableCell>
                  <TableCell className="text-red-500">{data.exits}</TableCell>
                  <TableCell>{data.entries - data.exits}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum histórico encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ProductConsumptionHistoryTab