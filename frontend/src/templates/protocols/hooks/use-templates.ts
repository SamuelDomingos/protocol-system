import { useDataCollection } from './use-data-collection';
import { TemplatesService } from '../services/templates.service';
import type { ProtocolTemplate } from '../types';

export function useTemplates() {
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
  } = useDataCollection<ProtocolTemplate>(
    {
      getAll: TemplatesService.getAll,
      delete: TemplatesService.delete
    },
  );

  return {
    templates: items,
    searchTerm,
    setSearchTerm,
    pagination,
    isLoading,
    error,
    loadTemplates: loadItems,
    deleteTemplate: deleteItem,
    isSearchMode
  };
}