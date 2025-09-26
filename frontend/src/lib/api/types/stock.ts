import { User } from './user';

export interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  category: string;
  minimumStock: number;
  status: 'active' | 'inactive';
  unit: string;
  supplier: string;
  specifications: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockLocation {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  location: string;
  price: number;
  sku: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: 'entrada' | 'saida';
  quantity: number;
  locationId: string;
  location?: StockLocation;
  userId: string;
  user?: User;
  reason: string;
  notes?: string;
  unitPrice: number;
  totalValue: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductCreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateInput = Partial<ProductCreateInput>;

export type StockLocationCreateInput = Omit<StockLocation, 'id' | 'product' | 'createdAt' | 'updatedAt'>;
export type StockLocationUpdateInput = Partial<StockLocationCreateInput>;

export type StockMovementCreateInput = Omit<StockMovement, 'id' | 'product' | 'location' | 'user' | 'createdAt' | 'updatedAt'>;
export type StockMovementUpdateInput = Partial<StockMovementCreateInput>;