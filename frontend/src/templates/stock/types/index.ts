import { UsePaginationReturn } from '@/src/global/pagination';
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

export interface ProductTableItem extends Product {
  selected?: boolean;
}

export interface StockLocationTableItem extends StockLocation {
  selected?: boolean;
}

export interface StockMovementTableItem extends StockMovement {
  selected?: boolean;
}

export interface ProductEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  batchNumber: string;
  expiryDate: Date | undefined;
  unitPrice: number;
  totalValue: number;
}

export interface ProductEntryListProps {
  entries: ProductEntry[];
  onEntriesChange: (entries: ProductEntry[]) => void;
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

export interface ProductsTableProps {
  products: Product[]
  onRowClick: (product: Product) => void
  pagination: UsePaginationReturn
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchData: () => void;
  deleteProduct: (id: string) => Promise<any>;
}

export interface MovementsTableProps {
  movements: StockMovement[]
  isLoading?: boolean
  onRowClick?: (movement: StockMovement) => void
  pagination: UsePaginationReturn
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchData: () => void;
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