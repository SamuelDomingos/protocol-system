import { useCallback } from 'react';
import { useStockData } from '../atoms/useStockData';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import * as stockService from '../../services/stockService';
import { StockLocation, StockLocationCreateInput, StockLocationUpdateInput } from '../../types';

export function useLocations() {
  const { handleError, handleSuccess } = useFeedbackHandler();
  
  const {
    items: locations,
    isLoading: loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    isSearchMode
  } = useStockData<StockLocation>(
    {
      getAll: stockService.getStockLocations
    }
  );

  const createLocation = useCallback(async (locationData: StockLocationCreateInput) => {
    try {
      const newLocation = await stockService.createStockLocation(locationData);
      handleSuccess('Localização criada com sucesso!');
      fetchData();
      return newLocation;
    } catch (error) {
      handleError(error, 'Erro ao criar localização');
      return null;
    }
  }, [fetchData, handleError, handleSuccess]);

  const updateLocation = useCallback(async (id: string, locationData: StockLocationUpdateInput) => {
    try {
      const updatedLocation = await stockService.updateStockLocation(id, locationData);
      handleSuccess('Localização atualizada com sucesso!');
      fetchData();
      return updatedLocation;
    } catch (error) {
      handleError(error, 'Erro ao atualizar localização');
      return null;
    }
  }, [fetchData, handleError, handleSuccess]);

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