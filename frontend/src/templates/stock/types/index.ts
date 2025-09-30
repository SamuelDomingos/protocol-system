import { UsePaginationReturn } from '@/src/global/pagination';
import { User } from '@/src/lib/api/types/user';
import { Supplier } from '@/src/lib/api/types/supplier';

// Re-export base types from API
export type { 
  Product, 
  ProductCreateInput, 
  ProductUpdateInput, 
  StockLocation, 
  StockLocationCreateInput, 
  StockLocationUpdateInput, 
  StockMovement, 
  StockMovementCreateInput, 
  StockMovementUpdateInput,
  ProductWithStock,
  PaginatedResponse,
  ProductsResponse,
  StockLocationsResponse,
  StockMovementsResponse
} from '@/src/lib/api/types/stock';

// Import types for use in interfaces below
import type { 
  Product, 
  StockLocation, 
  ProductCreateInput, 
  StockMovementCreateInput 
} from '@/src/lib/api/types/stock';

// Extended StockMovement interface with populated relations
export interface StockMovementWithRelations {
  id: string;
  productId: string;
  type: 'entrada' | 'saida' | 'transferencia';
  quantity: number;
  fromLocationId?: string;
  fromLocationType?: 'supplier' | 'user' | 'client';
  toLocationId?: string;
  toLocationType?: 'supplier' | 'user' | 'client';
  reason?: string;
  notes?: string;
  unitPrice?: number;
  totalValue?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  product?: Product;
  fromLocation?: { id: string; name: string };
  toLocation?: { id: string; name: string };
  user?: User;
}

// Extended Product interface for UI display with stock info
export interface ProductWithStockInfo extends Product {
  quantity?: number;
  totalQuantity?: number;
  locations?: StockLocation[];
}

export interface ProductTableItem extends ProductWithStockInfo {
  selected?: boolean;
}

export interface StockLocationTableItem extends StockLocation {
  selected?: boolean;
}

export interface StockMovementTableItem extends StockMovementWithRelations {
  selected?: boolean;
}

// Product entry interface for batch operations
export interface ProductEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  batchNumber: string;
  expiryDate: Date | undefined;
  unitPrice: number;
  totalValue: number;
  destinationId?: string;
}

export interface ProductEntryListProps {
  entries: ProductEntry[];
  onEntriesChange: (entries: ProductEntry[]) => void;
}

// Form data interfaces
export interface ProductFormData extends Omit<ProductCreateInput, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  quantity?: number;
  totalQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovementFormData extends StockMovementCreateInput {
  supplier?: string;
  entryType?: string;
  unit?: string;
}

// Filter and search interfaces
export interface FilterOptions {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'all';
  lowStock?: boolean;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

// Hook return types
export interface UseStockDataReturn<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  pagination: UsePaginationReturn;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchData: () => Promise<void>;
  isSearchMode: boolean;
}

// Dashboard and summary interfaces
export interface StockSummary {
  totalProducts: number;
  lowStockProducts: number;
  totalLocations: number;
  totalMovements: number;
}

export interface ProductWithLocation {
  product: ProductWithStockInfo;
  location: StockLocation;
  quantity: number;
}

export interface MovementSummary {
  totalEntries: number;
  totalExits: number;
  totalTransfers: number;
  recentMovements: StockMovementWithRelations[];
}

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'expired' | 'expiring_soon';
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  currentQuantity?: number;
  minQuantity?: number;
  expiryDate?: Date;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface DashboardData {
  summary: StockSummary;
  movements: MovementSummary;
  alerts: StockAlert[];
  lowStockProducts: ProductWithLocation[];
}

// Table component props
export interface ProductsTableProps {
  products: ProductWithStockInfo[];
  onRowClick: (product: ProductWithStockInfo) => void;
  pagination: UsePaginationReturn;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchData: () => void;
  deleteProduct: (id: string) => Promise<any>;
}

export interface MovementsTableProps {
  movements: StockMovementWithRelations[];
  isLoading?: boolean;
  onRowClick?: (movement: StockMovementWithRelations) => void;
  pagination: UsePaginationReturn;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchData: () => void;
}

// State management interfaces
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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

// Combobox option interface for forms
export interface ComboboxOption {
  value: string;
  label: string;
}

// Exit form specific interfaces
export interface ExitFormData {
  productId: string;
  quantity: number;
  exitType: string;
  destinationId?: string;
  reason?: string;
  notes?: string;
}

// Batch information interface
export interface BatchInfo {
  id: string;
  sku?: string;
  quantity: number;
  expiryDate?: string;
  price?: number;
}

// Type aliases for better readability
export type MovementType = 'entrada' | 'saida' | 'transferencia';

// Location type for movements
export type LocationType = 'supplier' | 'user' | 'client';

// Form validation interfaces
export interface FormErrors {
  [key: string]: string | undefined;
}

// API response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
  success: boolean;
}