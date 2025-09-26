import { apiRequest } from '@/src/utils/http';
import { StockLocation, StockLocationCreateInput, StockLocationUpdateInput } from '../types/stock';
import { PaginationRequestParams } from '@/src/global/pagination/types/pagination';

export const getStockLocations = async (params?: PaginationRequestParams): Promise<any> => {
  return apiRequest<any>('/stock-locations', {
    method: 'GET',
    params
  });
};

export const getStockLocationById = async (id: string): Promise<StockLocation> => {
  return apiRequest<StockLocation>(`/stock-locations/${id}`);
};

export const createStockLocation = async (location: StockLocationCreateInput): Promise<StockLocation> => {
  return apiRequest<StockLocation>('/stock-locations', {
    method: 'POST',
    body: location,
  });
};

export const updateStockLocation = async (id: string, location: StockLocationUpdateInput): Promise<StockLocation> => {
  return apiRequest<StockLocation>(`/stock-locations/${id}`, {
    method: 'PUT',
    body: location,
  });
};