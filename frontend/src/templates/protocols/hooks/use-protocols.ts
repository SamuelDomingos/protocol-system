import { useDataCollection } from './use-data-collection';
import { ProtocolsService } from '../services/protocols.service';
import type { Protocol } from '../types';

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