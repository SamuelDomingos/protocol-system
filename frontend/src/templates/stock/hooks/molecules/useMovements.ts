import { useCallback } from 'react';
import { useStockData } from '../atoms/useStockData';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import * as stockService from '../../services/stockService';
import { StockMovement, StockMovementCreateInput } from '../../types';

export function useMovements() {
  const { handleError, handleSuccess } = useFeedbackHandler();
  
  const {
    items: movements,
    isLoading: loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    isSearchMode
  } = useStockData<StockMovement>(
    {
      getAll: stockService.getStockMovements
    }
  );

  const createMovement = useCallback(async (movementData: StockMovementCreateInput) => {
    try {
      const newMovement = await stockService.createStockMovement(movementData);
      handleSuccess('Movimentação registrada com sucesso!');
      fetchData();
      return newMovement;
    } catch (error) {
      handleError(error, 'Erro ao registrar movimentação');
      return null;
    }
  }, [fetchData, handleError, handleSuccess]);

  const getMovementTypes = useCallback(async () => {
    try {
      return await stockService.getStockMovementTypes();
    } catch (error) {
      handleError(error, 'Erro ao buscar tipos de movimentação');
      return [];
    }
  }, [handleError]);

  return {
    movements,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchMovements: fetchData,
    createMovement,
    getMovementTypes,
    isSearchMode
  };
}