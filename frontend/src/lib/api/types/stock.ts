import { User } from './user';
import { Supplier } from './supplier';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  minimumStock: number;
  status: 'active' | 'inactive';
  unit: string;
  unitPrice?: number;
  totalQuantity?: number;
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockLocation {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  location: string;
  supplier?: Supplier;
  price?: number;
  sku?: string;
  expiryDate?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovementCreateInput {
  productId: string;
  type: 'entrada' | 'saida' | 'transferencia';
  quantity: number;
  fromLocationId?: string;
  fromLocationType?: 'supplier' | 'user' | 'client';
  toLocationId?: string;
  toLocationType?: 'supplier' | 'user' | 'client';
  userId: string;
  reason?: string;
  notes?: string;
  sku?: string;
  expiryDate?: Date;
  unitPrice?: number;
  totalValue?: number;
}

export interface StockMovement extends StockMovementCreateInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
  type: 'entrada' | 'saida' | 'transferencia';
}

export interface ProductWithStock {
  id: string;
  productId: string;
  quantity: number;
  location: string;
  price?: number;
  sku?: string;
  expiryDate?: string;
  product: {
    id: string;
    name: string;
    unit: string;
    unitPrice?: number;
  };
}

export type ProductCreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;

export type StockLocationCreateInput = Omit<StockLocation, 'id' | 'product' | 'supplier' | 'createdAt' | 'updatedAt'>;
export type StockLocationUpdateInput = Partial<StockLocationCreateInput>;

export type StockMovementUpdateInput = Partial<StockMovementCreateInput>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export type ProductsResponse = PaginatedResponse<Product>;
export type StockLocationsResponse = PaginatedResponse<StockLocation>;
export type StockMovementsResponse = PaginatedResponse<StockMovement>;
