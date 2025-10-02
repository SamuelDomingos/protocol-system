import { useDataCollection } from '@/src/templates/protocols/hooks/atoms/use-data-collection';

import type { Protocol } from '@/src/templates/protocols/types';
import { getProtocols, deleteProtocol } from '@/src/lib/api/protocols';

export function useProtocols() {
  const {
    items,
    searchTerm,
    setSearchTerm,
    pagination,
    isLoading,
    error,
    loadItems,
    deleteItem,
    isSearchMode
  } = useDataCollection<Protocol>(
    {
      getAll: getProtocols,
      delete: deleteProtocol
    },
  );

  return {
    protocols: items,
    searchTerm,
    setSearchTerm,
    pagination,
    isLoading,
    error,
    loadProtocols: loadItems,
    deleteProtocol: deleteItem,
    isSearchMode
  };
}