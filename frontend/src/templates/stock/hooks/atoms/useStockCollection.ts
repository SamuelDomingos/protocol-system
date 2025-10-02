import { useState, useEffect, useCallback, useRef } from 'react';
import { usePagination } from '@/src/global/pagination';
import { useSearch } from '@/src/global/search/hooks/use-search';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';

type GetAllFn<T> = (params?: any) => Promise<any>;

interface CrudService<T, CreateInput = any, UpdateInput = any> {
  getAll: GetAllFn<T>;
  create?: (input: CreateInput) => Promise<T>;
  update?: (id: string, input: UpdateInput) => Promise<T>;
  delete?: (id: string) => Promise<void>;
  toggleStatus?: (id: string) => Promise<any>;
}

interface Messages {
  createSuccess?: string;
  updateSuccess?: string;
  deleteSuccess?: string;
  toggleStatusSuccess?: string;
}

export function useStockCollection<T extends { id: string }, C = any, U = any>(
  service: CrudService<T, C, U>,
  messages: Messages = {},
  initialOptions = {
    initialPage: 1,
    initialItemsPerPage: 10
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { handleError, handleSuccess } = useFeedbackHandler();
  const search = useSearch();
  
  const pagination = usePagination({
    initialPage: initialOptions.initialPage,
    initialItemsPerPage: initialOptions.initialItemsPerPage
  });

  const getAllRef = useRef<GetAllFn<T>>(service.getAll);
  useEffect(() => {
    getAllRef.current = service.getAll;
  }, [service.getAll]);

  const mapResponseToItems = (response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response as T[];
    if (response.data) return response.data as T[];
    if (response.rows) return response.rows as T[];
    if (response.items) return response.items as T[];
    return [];
  };

  // Depende apenas de valores primitivos estáveis
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        ...pagination.getRequestParams(),
        // Usa termo debounced para evitar múltiplas chamadas durante digitação
        search: search.debouncedSearchTerm
      };

      const response = await getAllRef.current(params);
      const data = mapResponseToItems(response);

      setItems(data);

      if (response && response.pagination && typeof response.pagination === 'object' && 'currentPage' in response.pagination) {
        pagination.updateFromResponse(response);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, search.debouncedSearchTerm]);

  const createItem = useCallback(async (input: C): Promise<T | null> => {
    if (!service.create) return null;
    try {
      const created = await service.create(input);
      handleSuccess(messages.createSuccess || 'Criado com sucesso!');
      fetchData();
      return created;
    } catch (err) {
      handleError(err, 'Erro ao criar item');
      return null;
    }
  }, [service.create, messages.createSuccess, fetchData, handleError, handleSuccess]);

  const updateItem = useCallback(async (id: string, input: U): Promise<T | null> => {
    if (!service.update) return null;
    try {
      const updated = await service.update(id, input);
      handleSuccess(messages.updateSuccess || 'Atualizado com sucesso!');
      fetchData();
      return updated;
    } catch (err) {
      handleError(err, 'Erro ao atualizar item');
      return null;
    }
  }, [service.update, messages.updateSuccess, fetchData, handleError, handleSuccess]);

  const deleteItem = useCallback(async (id: string): Promise<boolean | null> => {
    if (!service.delete) return null;
    try {
      await service.delete(id);
      handleSuccess(messages.deleteSuccess || 'Excluído com sucesso!');
      fetchData();
      return true;
    } catch (err) {
      handleError(err, 'Erro ao excluir item');
      return null;
    }
  }, [service.delete, messages.deleteSuccess, fetchData, handleError, handleSuccess]);

  const toggleStatus = useCallback(async (id: string): Promise<boolean | null> => {
    if (!service.toggleStatus) return null;
    try {
      await service.toggleStatus(id);
      handleSuccess(messages.toggleStatusSuccess || 'Status atualizado com sucesso!');
      fetchData();
      return true;
    } catch (err) {
      handleError(err, 'Erro ao atualizar status');
      return null;
    }
  }, [service.toggleStatus, messages.toggleStatusSuccess, fetchData, handleError, handleSuccess]);

  // Agora o efeito depende apenas de fetchData que, por sua vez, depende de valores primitivos estáveis
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    isLoading,
    error,
    pagination,
    searchTerm: search.searchTerm,
    setSearchTerm: search.setSearchTerm,
    fetchData,
    isSearchMode: search.searchTerm.length > 0,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus
  };
}