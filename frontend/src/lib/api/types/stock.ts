import { User } from './user';
import { Supplier } from './supplier';

export interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  category: string;
  minimumStock: number;
  status: 'active' | 'inactive';
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockLocation {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  supplierId: string;
  supplier?: Supplier;
  price: number;
  sku: string;
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
  reason?: string;
  notes?: string;
  unitPrice?: number;
  totalValue?: number;
  sku?: string;
  expiryDate?: string;
}

export interface ProductWithStock {
  id: string;
  productId: string;
  quantity: number;
  location: string;
  price: number;
  sku?: string;
  expiryDate?: string;
  product: {
    id: string;
    name: string;
    unit: string;
    unitPrice: number;
  };
}

export interface StockMovement extends StockMovementCreateInput {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductCreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;

export type StockLocationCreateInput = Omit<StockLocation, 'id' | 'product' | 'supplier' | 'createdAt' | 'updatedAt'>;
export type StockLocationUpdateInput = Partial<StockLocationCreateInput>;

export type StockMovementCreateInput = Omit<StockMovement, 'id' | 'product' | 'location' | 'user' | 'createdAt' | 'updatedAt'>;
export type StockMovementUpdateInput = Partial<StockMovementCreateInput>;
