import { apiRequest } from '@/src/utils/http';
import { Product, ProductCreateInput, ProductUpdateInput } from '../types/stock';
import { PaginationRequestParams } from '@/src/global/pagination/types/pagination';

export const getProducts = async (params?: PaginationRequestParams): Promise<any> => {
  return apiRequest<any>('api/products', {
    method: 'GET',
    params
  });
};

export const getProductById = async (id: string): Promise<Product> => {
  return apiRequest<Product>(`api/products/${id}`);
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  return apiRequest<Product[]>('api/products/low-stock');
};

export const getNearExpiryProducts = async (): Promise<Product[]> => {
  return apiRequest<Product[]>('api/products/near-expiry');
};

export const createProduct = async (product: ProductCreateInput): Promise<Product> => {
  return apiRequest<Product>('api/products', {
    method: 'POST',
    body: product,
  });
};

export const updateProduct = async (id: string, product: ProductUpdateInput): Promise<Product> => {
  return apiRequest<Product>(`api/products/${id}`, {
    method: 'PUT',
    body: product,
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  return apiRequest<void>(`api/products/${id}`, {
    method: 'DELETE',
  });
};

export const toggleProductStatus = async (id: string): Promise<Product> => {
  return apiRequest<Product>(`api/products/${id}/toggle-active`, {
    method: 'PATCH',
  });
};