"use client"

import { useMemo } from 'react'

type CardStyleOptions = {
  variant?: 'default' | 'warning' | 'success' | 'danger'
}

export function useCardStyles(options: CardStyleOptions = {}) {
  const { variant = 'default' } = options
  
  const colorClass = useMemo(() => {
    switch (variant) {
      case 'warning':
        return 'text-yellow-500'
      case 'success':
        return 'text-green-500'
      case 'danger':
        return 'text-red-500'
      default:
        return 'text-primary'
    }
  }, [variant])

  return {
    colorClass
  }
}

export default useCardStyles