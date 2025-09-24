"use client";

import { useState, useEffect } from "react";
import { useUrlParams } from "@/src/hooks/useUrlParams";
import { useDebounce } from "@/src/hooks/use-debounce";
import { ClientsService } from "../services/clientsService";
import type { Client, UseClientsReturn } from "../types";
import { usePagination } from "@/src/global/pagination";

export const useClients = (): UseClientsReturn => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { params, setSearch: setUrlSearch } = useUrlParams();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const pagination = usePagination({
    initialItemsPerPage: 10,
    syncWithUrl: true,
  });

  const isSearchMode = ClientsService.shouldUseSearch(searchTerm);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = pagination.getRequestParams();
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const response = await ClientsService.fetchClients(params);
      
      setClients(response.clients);

      pagination.updateFromResponse(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar clientes"
      );
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      fetchClients();
      if (debouncedSearchTerm) {
        setUrlSearch(debouncedSearchTerm);
      }
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchClients();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const refreshClients = async () => {
    await fetchClients();
  };

  return {
    clients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refreshClients,
    isSearchMode,
    pagination,
  };
};
