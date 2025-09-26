import { Product, ProductCreateInput, ProductUpdateInput, StockLocation, StockLocationCreateInput, StockLocationUpdateInput, StockMovement, StockMovementCreateInput, StockMovementUpdateInput } from '../../../lib/api/types/stock';

export type { 
  Product, 
  ProductCreateInput, 
  ProductUpdateInput, 
  StockLocation, 
  StockLocationCreateInput, 
  StockLocationUpdateInput, 
  StockMovement, 
  StockMovementCreateInput, 
  StockMovementUpdateInput 
};

// Tipos adicionais específicos para a UI
export interface ProductTableItem extends Product {
  selected?: boolean;
}

export interface StockLocationTableItem extends StockLocation {
  selected?: boolean;
}

export interface StockMovementTableItem extends StockMovement {
  selected?: boolean;
}

export interface RequestParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [key: string]: any;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  brand?: string;
  status?: 'active' | 'inactive' | 'all';
  lowStock?: boolean;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface StockState {
  products: {
    items: ProductTableItem[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
    filters: FilterOptions;
  };
  locations: {
    items: StockLocationTableItem[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
    filters: FilterOptions;
  };
  movements: {
    items: StockMovementTableItem[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
    filters: FilterOptions;
  };
}