
import { useCallback, useMemo } from 'react';
import { useStockCollection } from './useStockCollection';
import { getStockLocations, createStockLocation, updateStockLocation } from '@/src/lib/api/stock';
import { StockLocation, StockLocationCreateInput, StockLocationUpdateInput } from '../../types';

export function useLocations() {
  const service = useMemo(() => ({
    getAll: getStockLocations,
    create: createStockLocation,
    update: updateStockLocation,
  }), []);

  const messages = useMemo(() => ({
    createSuccess: 'Localização criada com sucesso!',
    updateSuccess: 'Localização atualizada com sucesso!',
  }), []);

  const {
    items: locations,
    isLoading: loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    isSearchMode,
    createItem,
    updateItem,
  } = useStockCollection<StockLocation, StockLocationCreateInput, StockLocationUpdateInput>(
    service,
    messages
  );

  const createLocation = useCallback(async (locationData: StockLocationCreateInput) => {
    return await createItem(locationData);
  }, [createItem]);

  const updateLocation = useCallback(async (id: string, locationData: StockLocationUpdateInput) => {
    return await updateItem(id, locationData);
  }, [updateItem]);

  return {
    locations,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchLocations: fetchData,
    createLocation,
    updateLocation,
    isSearchMode
  };
}