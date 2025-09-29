import { apiRequest } from '@/src/utils/http';
import { Supplier, SupplierCreateInput, SupplierUpdateInput } from '../types/supplier';
import { PaginationRequestParams } from '@/src/global/pagination/types/pagination';

export const getSuppliers = async (params?: PaginationRequestParams): Promise<any> => {
  return apiRequest<any>('/api/suppliers', {
    method: 'GET',
    params
  });
};

export const getSupplierById = async (id: string): Promise<Supplier> => {
  return apiRequest<Supplier>(`/api/suppliers/${id}`);
};

export const getSuppliersByType = async (type: 'unit' | 'supplier'): Promise<Supplier[]> => {
  return apiRequest<Supplier[]>(`/api/suppliers/type/${type}`);
};

export const getSuppliersByCategory = async (category: string): Promise<Supplier[]> => {
  return apiRequest<Supplier[]>(`/api/suppliers/category/${category}`);
};

export const getOnlySuppliers = async (): Promise<Supplier[]> => {
  return apiRequest<Supplier[]>('/api/suppliers/suppliers');
};

export const getOnlyUnits = async (): Promise<Supplier[]> => {
  return apiRequest<Supplier[]>('/api/suppliers/units');
};

export const getSupplierCategories = async (): Promise<string[]> => {
  return apiRequest<string[]>('/api/suppliers/categories');
};

export const searchSuppliers = async (term: string): Promise<Supplier[]> => {
  return apiRequest<Supplier[]>('/api/suppliers/search', {
    method: 'GET',
    params: { term }
  });
};

export const createSupplier = async (supplier: SupplierCreateInput): Promise<Supplier> => {
  return apiRequest<Supplier>('/api/suppliers', {
    method: 'POST',
    body: supplier,
  });
};

export const updateSupplier = async (id: string, supplier: SupplierUpdateInput): Promise<Supplier> => {
  return apiRequest<Supplier>(`/api/suppliers/${id}`, {
    method: 'PUT',
    body: supplier,
  });
};

export const deleteSupplier = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/suppliers/${id}`, {
    method: 'DELETE',
  });
};