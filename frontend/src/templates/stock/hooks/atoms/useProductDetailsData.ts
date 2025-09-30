"use client"

import { useCallback, useState, useEffect } from 'react'
import { Product, StockLocation, StockMovement } from '@/src/lib/api/types/stock'
import * as stockService from '../../services/stockService'
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler'
import { usePagination } from '@/src/global/pagination'

export function useProductDetailsData(productId?: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [locations, setLocations] = useState<StockLocation[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [totalMovements, setTotalMovements] = useState(0)
  const { handleError } = useFeedbackHandler()

  const movementsPagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    syncWithUrl: false
  })

  const fetchProductDetails = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const productData = await stockService.getProductById(id)
      setProduct(productData)
      return productData
    } catch (error) {
      handleError(error, 'Erro ao carregar detalhes do produto')
      return null
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const fetchProductLocations = useCallback(async (id: string) => {
    try {
      const productLocations = await stockService.getAllBatchesByProduct(id)
      if (productLocations) {
        setLocations(productLocations)
        return productLocations
      }
      return []
    } catch (error) {
      handleError(error, 'Erro ao carregar localizações do produto')
      return []
    }
  }, [handleError])

  const fetchProductMovements = useCallback(async (id: string, params?: any) => {
    setMovementsLoading(true)
    try {
      const response = await stockService.getStockMovementsByProduct(id, params);
      if (response) {
        setMovements(response.movements || []);
        setTotalMovements(response.totalCount || 0);
        
        // Atualizar informações de paginação
        movementsPagination.updateFromResponse({
          data: response.movements || [],
          pagination: {
            currentPage: response.currentPage || 1,
            totalPages: response.totalPages || 1,
            totalItems: response.totalCount || 0,
            itemsPerPage: params?.limit || 10,
            hasNextPage: (response.currentPage || 1) < (response.totalPages || 1),
            hasPreviousPage: (response.currentPage || 1) > 1
          }
        });
        
        return response.movements;
      }
      return [];
    } catch (error) {
      handleError(error, 'Erro ao carregar movimentações do produto');
      return [];
    } finally {
      setMovementsLoading(false)
    }
  }, [handleError]);

  const fetchAllProductData = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await Promise.all([
        fetchProductDetails(id),
        fetchProductLocations(id),
        fetchProductMovements(id, movementsPagination.getRequestParams())
      ])
    } catch (error) {
      handleError(error, 'Erro ao carregar dados do produto')
    } finally {
      setLoading(false)
    }
  }, [fetchProductDetails, fetchProductLocations, fetchProductMovements, handleError])

  // Recarregar movimentações quando a paginação mudar
  useEffect(() => {
    if (productId) {
      const params = movementsPagination.getRequestParams()
      fetchProductMovements(productId, params)
    }
  }, [productId, movementsPagination.currentPage, movementsPagination.itemsPerPage, fetchProductMovements])

  useEffect(() => {
    if (productId) {
      fetchAllProductData(productId)
    }
  }, [productId, fetchAllProductData])

  return {
    product,
    locations,
    movements,
    loading,
    movementsLoading,
    totalMovements,
    movementsPagination,
    fetchAllProductData,
    fetchProductDetails,
    fetchProductLocations,
    fetchProductMovements
  }
}