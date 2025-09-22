'use client';

import { useState, useEffect } from 'react';
import { getClients, searchClients, deleteClient } from '@/src/lib/api';
import type { Client, ClientSearchParams } from '@/src/lib/api/types';

interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refreshClients: () => Promise<void>;
}

export const useClients = (): UseClientsReturn => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async (params?: ClientSearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getClients(params);
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      await fetchClients();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await searchClients(term);
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshClients = async () => {
    if (searchTerm) {
      await handleSearch(searchTerm);
    } else {
      await fetchClients();
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return {
    clients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refreshClients,
  };
};