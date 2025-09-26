import { useCallback } from 'react';
import { useStockData } from '../atoms/useStockData';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import * as stockService from '../../services/stockService';
import { Product, ProductCreateInput, ProductUpdateInput } from '../../types';
import { toast } from '@/src/hooks/use-toast';

export function useProducts() {
  const { handleError, handleSuccess } = useFeedbackHandler();
  
  const {
    items: products,
    isLoading: loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    isSearchMode
  } = useStockData<Product>(
    {
      getAll: stockService.getProducts
    }
  );

  const createProduct = useCallback(async (productData: ProductCreateInput) => {
    try {
      const newProduct = await stockService.createProduct(productData);
      handleSuccess('Produto criado com sucesso!');
      fetchData();
      return newProduct;
    } catch (error) {
      handleError(error, 'Erro ao criar produto');
      return null;
    }
  }, [fetchData, handleError, handleSuccess]);

  const updateProduct = useCallback(async (id: string, productData: ProductUpdateInput) => {
    try {
      const updatedProduct = await stockService.updateProduct(id, productData);
      handleSuccess('Produto atualizado com sucesso!');
      fetchData();
      return updatedProduct;
    } catch (error) {
      handleError(error, 'Erro ao atualizar produto');
      return null;
    }
  }, [fetchData, handleError, handleSuccess]);

  const toggleProductStatus = useCallback(async (id: string) => {
    try {
      await stockService.toggleProductStatus(id);
      handleSuccess('Status do produto alterado com sucesso!');
      fetchData();
      return true;
    } catch (error) {
      handleError(error, 'Erro ao alterar status do produto');
      return false;
    }
  }, [fetchData, handleError, handleSuccess]);

  const getLowStockProducts = useCallback(async () => {
    try {
      return await stockService.getLowStockProducts();
    } catch (error) {
      handleError(error, 'Erro ao buscar produtos com estoque baixo');
      return { data: [], pagination: { total: 0, page: 1, pageSize: 10 } };
    }
  }, [handleError]);

  const getCategories = useCallback(async () => {
    try {
      return await stockService.getProductCategories();
    } catch (error) {
      handleError(error, 'Erro ao buscar categorias');
      return [];
    }
  }, [handleError]);

  const getBrands = useCallback(async () => {
    try {
      return await stockService.getProductBrands();
    } catch (error) {
      handleError(error, 'Erro ao buscar marcas');
      return [];
    }
  }, [handleError]);

  return {
    products,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchProducts: fetchData,
    createProduct,
    updateProduct,
    toggleProductStatus,
    getLowStockProducts,
    getCategories,
    getBrands,
    isSearchMode
  };
}