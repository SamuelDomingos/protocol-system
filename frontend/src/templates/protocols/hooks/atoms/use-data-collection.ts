import { useState, useEffect } from 'react';
import { usePagination } from '@/src/global/pagination';
import { useSearch } from '@/src/global/search/hooks/use-search';
import { toast } from '@/src/hooks/use-toast';

interface DataService{
  getAll: (params?: any) => Promise<any>;
  delete: (id: string) => Promise<void>;
}

export function useDataCollection<T extends { id: string }>(
  service: DataService,
  initialOptions = {
    initialPage: 1,
    initialItemsPerPage: 10
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useSearch();
  
  const pagination = usePagination({
    initialPage: initialOptions.initialPage,
    initialItemsPerPage: initialOptions.initialItemsPerPage
  });

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        ...pagination.getRequestParams(),
        search: search.searchTerm
      };

      const response = await service.getAll(params);

      let data: T[] = [];
      
      if (response) {
        if (Array.isArray(response)) {
          data = response;
        } 
        else if (response.data) {
          data = response.data;
        }
        else if (response.protocols) {
          data = response.protocols;
        }
        else if (response.templates) {
          data = response.templates;
        }
        else if (response.rows) {
          data = response.rows;
        }
      }
      
      setItems(data as T[]);

      if (response && response.pagination && 
          typeof response.pagination === 'object' && 
          'currentPage' in response.pagination) {
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
    try {
      await service.delete(id);
      toast({
        title: "Item deletado com sucesso",
        description: "O item foi deletado com sucesso",
        variant: "destructive",
      });
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir item');
    }
  };

  useEffect(() => {
    loadItems();
  }, [pagination.currentPage, pagination.itemsPerPage, search.debouncedSearchTerm]);

  return {
    items,
    searchTerm: search.searchTerm,
    setSearchTerm: search.setSearchTerm,
    pagination,
    isLoading,
    error,
    loadItems,
    deleteItem,
    isSearchMode: search.searchTerm.length > 0
  };
}