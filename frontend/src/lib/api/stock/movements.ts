import { apiRequest } from '@/src/utils/http';
import { StockMovement, StockMovementCreateInput, StockMovementUpdateInput } from '../types/stock';
import { PaginationRequestParams } from '@/src/global/pagination/types/pagination';

export const getStockMovements = async (params?: PaginationRequestParams): Promise<any> => {
  return apiRequest<any>('/api/stock-movements', {
    method: 'GET',
    params
  });
};

export const getStockMovementById = async (id: string): Promise<StockMovement> => {
  return apiRequest<StockMovement>(`/api/stock-movements/${id}`);
};

export const createStockMovement = async (movement: StockMovementCreateInput): Promise<StockMovement> => {
  return apiRequest<StockMovement>('/api/stock-movements', {
    method: 'POST',
    body: movement,
  });
};

export const updateStockMovement = async (id: string, movement: StockMovementUpdateInput): Promise<StockMovement> => {
  return apiRequest<StockMovement>(`/api/stock-movements/${id}`, {
    method: 'PUT',
    body: movement,
  });
};

export const getStockMovementTypes = async (): Promise<string[]> => {
  return apiRequest<string[]>('/api/stock-movements/types');
};
