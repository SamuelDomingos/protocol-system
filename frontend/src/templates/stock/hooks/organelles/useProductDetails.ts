"use client"

import { useMemo } from 'react'
import { Product, StockLocation, StockMovement } from '@/src/lib/api/types/stock'

export function useProductDetails(
  product: Product | null,
  locations: StockLocation[],
  movements: StockMovement[]
) {
  // Calcular o valor total do produto
  const totalValue = useMemo(() => {
    if (!product) return 0
    return product.unitPrice ? product.unitPrice * (product.quantity || 0) : 0
  }, [product])

  const productMovements = useMemo(() => {
    if (!product) return []
    return movements.filter(m => m.productId === product.id)
  }, [product, movements])

  const productLocations = useMemo(() => {
    if (!product) return []
    return locations.filter(loc => loc.productId === product.id)
  }, [product, locations])

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

  return {
    totalValue,
    productMovements,
    productLocations,
    movementsByMonth,
    hasData: !!product
  }
}

export default useProductDetails