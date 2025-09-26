"use client"

import { useState, useEffect } from 'react';
import { usePagination } from '@/src/global/pagination';
import { useSearch } from '@/src/global/search/hooks/use-search';
import { PaginatedResponse } from '@/src/global/pagination/types/pagination';

interface StockService<T> {
  getAll: (params?: any) => Promise<PaginatedResponse<T>>;
  delete?: (id: string) => Promise<void>;
}

interface UseStockDataProps {
  initialPage?: number;
  initialItemsPerPage?: number;
}

export function useStockData<T>(
  service: StockService<T>,
  initialOptions: UseStockDataProps = {
    initialPage: 1,
    initialItemsPerPage: 10
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useSearch();
  
  const pagination = usePagination({
    initialPage: initialOptions.initialPage || 1,
    initialItemsPerPage: initialOptions.initialItemsPerPage || 10
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        ...pagination.getRequestParams(),
        search: search.searchTerm
      };

      const response = await service.getAll(params);
      
      if (response && response.data) {
        setItems(response.data);
      }

      if (response && response.pagination) {
        pagination.updateFromResponse(response);
      }
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!service.delete) {
      setError('Função de exclusão não disponível');
      return;
    }
    
    try {
      await service.delete(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir item');
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, pagination.itemsPerPage, search.debouncedSearchTerm]);

  return {
    items,
    searchTerm: search.searchTerm,
    setSearchTerm: search.setSearchTerm,
    pagination,
    isLoading,
    error,
    fetchData,
    deleteItem,
    isSearchMode: search.searchTerm.length > 0
  };
}