import { useCallback } from 'react';
import { useStockData } from '@/src/templates/stock/hooks/atoms/useStockData';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import * as stockService from '../../services/stockService';
import { Product, ProductCreateInput, ProductUpdateInput } from '../../types';

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
      return null;
    }
  }, [fetchData, handleError, handleSuccess]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await stockService.deleteProduct(id);
      handleSuccess('Produto excluído com sucesso!');
      fetchData();
      return true;
    } catch (error) {
      handleError(error, 'Erro ao excluir produto');
      return null;
    }
  }, [fetchData, handleError, handleSuccess]);

  return {
    products,
    loading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    fetchData,
    isSearchMode,
    createProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
  };
}