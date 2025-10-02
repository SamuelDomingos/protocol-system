import { useCallback, useMemo } from 'react';
import { useStockCollection } from './useStockCollection';
import { getStockMovements, createStockMovement, updateStockMovement, getStockMovementTypes } from '@/src/lib/api/stock';
import { StockMovement, StockMovementCreateInput } from '../../types';

export function useMovements() {
  const service = useMemo(() => ({
    getAll: getStockMovements,
    create: createStockMovement,
    update: updateStockMovement,
  }), []);

  const messages = useMemo(() => ({
    createSuccess: 'Movimentação registrada com sucesso!',
    updateSuccess: 'Movimentação atualizada com sucesso!',
  }), []);

  const {
    items: movements,
    isLoading: loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    isSearchMode,
    createItem,
    updateItem,
  } = useStockCollection<StockMovement, StockMovementCreateInput, StockMovementCreateInput>(
    service,
    messages
  );

  const createMovement = useCallback(async (movementData: StockMovementCreateInput) => {
    return await createItem(movementData);
  }, [createItem]);

  const updateMovement = useCallback(async (id: string, movementData: StockMovementCreateInput) => {
    return await updateItem(id, movementData);
  }, [updateItem]);

  const getMovementTypes = useCallback(async () => {
    try {
      return await getStockMovementTypes();
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  return {
    movements,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchMovements: fetchData,
    createMovement,
    updateMovement,
    getMovementTypes,
    isSearchMode
  };
}