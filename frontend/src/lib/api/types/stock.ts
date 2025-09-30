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
  unitPrice?: number;
  totalValue?: number;
}

export interface StockMovement extends StockMovementCreateInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
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

// Tipos para criação e atualização
export type ProductCreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;

export type StockLocationCreateInput = Omit<StockLocation, 'id' | 'product' | 'supplier' | 'createdAt' | 'updatedAt'>;
export type StockLocationUpdateInput = Partial<StockLocationCreateInput>;

export type StockMovementUpdateInput = Partial<StockMovementCreateInput>;

// Interface para resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Tipos específicos para respostas da API
export type ProductsResponse = PaginatedResponse<Product>;
export type StockLocationsResponse = PaginatedResponse<StockLocation>;
export type StockMovementsResponse = PaginatedResponse<StockMovement>;
