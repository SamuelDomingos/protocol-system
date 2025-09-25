import { useDataCollection } from '@/src/templates/protocols/hooks/atoms/use-data-collection';
import { ProtocolsService } from '@/src/templates/protocols/services/molecules/protocols.service';
import type { Protocol } from '@/src/templates/protocols/types';

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
      getAll: ProtocolsService.getAll,
      delete: ProtocolsService.delete
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