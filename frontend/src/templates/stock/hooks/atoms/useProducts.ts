
import { useCallback, useMemo } from 'react';
import { useStockCollection } from './useStockCollection';
import {
  getProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
} from '@/src/lib/api/stock';
import { Product, ProductCreateInput, ProductUpdateInput } from '../../types';
import { getLowStockProducts, getNearExpiryProducts } from '@/src/lib/api';

export function useProducts() {
  const service = useMemo(() => ({
    getAll: getProducts,
    create: createProduct,
    update: updateProduct,
    delete: deleteProduct,
    toggleStatus: toggleProductStatus
  }), []);

  const messages = useMemo(() => ({
    createSuccess: 'Produto criado com sucesso!',
    updateSuccess: 'Produto atualizado com sucesso!',
    deleteSuccess: 'Produto excluído com sucesso!',
    toggleStatusSuccess: 'Status do produto alterado com sucesso!'
  }), []);

  const {
    items: products,
    isLoading: loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    isSearchMode,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus
  } = useStockCollection<Product, ProductCreateInput, ProductUpdateInput>(
    service,
    messages
  );

  const createProductHandler = useCallback(async (productData: ProductCreateInput) => {
    return await createItem(productData);
  }, [createItem]);

  const updateProductHandler = useCallback(async (id: string, productData: ProductUpdateInput) => {
    return await updateItem(id, productData);
  }, [updateItem]);

  const toggleProductStatusHandler = useCallback(async (id: string) => {
    return await toggleStatus(id);
  }, [toggleStatus]);

  const deleteProductHandler = useCallback(async (id: string) => {
    return await deleteItem(id);
  }, [deleteItem]);

  return {
    products,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    getLowStockProducts,
    getNearExpiryProducts,
    isSearchMode,
    createProduct: createProductHandler,
    updateProduct: updateProductHandler,
    toggleProductStatus: toggleProductStatusHandler,
    deleteProduct: deleteProductHandler,
  };
}