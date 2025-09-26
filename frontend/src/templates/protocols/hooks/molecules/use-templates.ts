import { useDataCollection } from '@/src/templates/protocols/hooks/atoms/use-data-collection';
import { TemplatesService } from '@/src/templates/protocols/services/molecules/templates.service';
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