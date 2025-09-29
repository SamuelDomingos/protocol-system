import { useState, useEffect, useCallback } from 'react';
import { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier,
  getSupplierCategories,
  searchSuppliers
} from '@/src/lib/api/supplier';
import { Supplier, SupplierFormData, SupplierFilters } from '../types';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState<SupplierFilters>({});
  const { handleSuccess, handleError } = useFeedbackHandler();

  const fetchSuppliers = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...filters
      };
      
      const response = await getSuppliers(params);
      setSuppliers(response.rows || response.data || []);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil((response.count || response.total || 0) / limit),
        totalItems: response.count || response.total || 0,
        itemsPerPage: limit
      });
    } catch (error) {
      handleError('Erro ao carregar fornecedores');
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, handleError]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getSupplierCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const handleCreateSupplier = async (data: SupplierFormData) => {
    try {
      setLoading(true);
      await createSupplier(data);
      handleSuccess('Fornecedor criado com sucesso!');
      fetchSuppliers(pagination.currentPage);
      return true;
    } catch (error) {
      handleError('Erro ao criar fornecedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupplier = async (id: string, data: SupplierFormData) => {
    try {
      setLoading(true);
      await updateSupplier(id, data);
      handleSuccess('Fornecedor atualizado com sucesso!');
      fetchSuppliers(pagination.currentPage);
      return true;
    } catch (error) {
      handleError('Erro ao atualizar fornecedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      setLoading(true);
      await deleteSupplier(id);
      handleSuccess('Fornecedor excluído com sucesso!');
      fetchSuppliers(pagination.currentPage);
      return true;
    } catch (error) {
      handleError('Erro ao excluir fornecedor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      fetchSuppliers(1);
      return;
    }

    try {
      setLoading(true);
      const results = await searchSuppliers(term);
      setSuppliers(results);
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: results.length
      }));
    } catch (error) {
      handleError('Erro ao buscar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<SupplierFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchSuppliers();
    fetchCategories();
  }, [fetchSuppliers, fetchCategories]);

  return {
    suppliers,
    categories,
    loading,
    pagination,
    filters,
    fetchSuppliers,
    handleCreateSupplier,
    handleUpdateSupplier,
    handleDeleteSupplier,
    handleSearch,
    updateFilters
  };
};