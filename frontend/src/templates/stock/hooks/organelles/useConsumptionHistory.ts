"use client"

import { StockMovement } from '@/src/lib/api/types/stock'

export function useConsumptionHistory(movements: StockMovement[], productId?: string) {
  const filteredMovements = productId 
    ? movements.filter(m => m.productId === productId)
    : movements
  const movementsByMonth: Record<string, { month: string, entries: number, exits: number }> = {}
  
  filteredMovements.forEach(movement => {
    if (!movement.createdAt) return
    
    const date = new Date(movement.createdAt)
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
    
    if (!movementsByMonth[monthYear]) {
      movementsByMonth[monthYear] = { month: monthYear, entries: 0, exits: 0 }
    }
    
    if (movement.type === 'entrada') {
      movementsByMonth[monthYear].entries += movement.quantity
    } else if (movement.type === 'saida') {
      movementsByMonth[monthYear].exits += movement.quantity
    }
  })

  const chartData = Object.values(movementsByMonth).sort((a, b) => {
    const [monthA, yearA] = a.month.split('/').map(Number)
    const [monthB, yearB] = b.month.split('/').map(Number)
    
    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })

  return {
    chartData,
    hasData: chartData.length > 0
  }
}

export default useConsumptionHistory