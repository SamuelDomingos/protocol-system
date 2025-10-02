import { useDataCollection } from '@/src/templates/protocols/hooks/atoms/use-data-collection';
import { getTemplates, deleteTemplate } from '@/src/lib/api/protocols';
import type { Protocol } from '@/src/templates/protocols/types';

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
  } = useDataCollection<Protocol>(
    {
      getAll: getTemplates,
      delete: deleteTemplate
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
    isSearchMode,
    loadItems,
  };
}