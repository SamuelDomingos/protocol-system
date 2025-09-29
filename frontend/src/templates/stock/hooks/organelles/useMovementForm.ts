import { useState, useCallback, useEffect } from 'react';
import { useMovements } from '../molecules/useMovements';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import { StockMovementCreateInput } from '../../types';
import { useProductEntryList } from './useProductEntryList';

interface UseMovementFormProps {
  onSuccess?: () => void;
  initialType?: 'entrada' | 'saida';
}

export function useMovementForm({ onSuccess, initialType }: UseMovementFormProps = {}) {
  const [formData, setFormData] = useState<Partial<StockMovementCreateInput> & { 
    supplier?: string;
    entryType?: string;
  }>({
    type: initialType || 'entrada',
    supplier: '',
    entryType: '',
    productId: '',
    quantity: 0,
    locationId: '',
    userId: '',
    reason: '',
    unitPrice: 0,
    totalValue: 0,
  });

  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());

  const productEntryList = useProductEntryList();

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      type: initialType || 'entrada' 
    }));
  }, [initialType]);

  const { createMovement } = useMovements();
  const { handleError, handleSuccess } = useFeedbackHandler();
  const [loading, setLoading] = useState(false);

  const locations = [
    { id: '1', name: 'Estoque Principal' },
    { id: '2', name: 'Estoque Secundário' },
    { id: '3', name: 'Loja A' },
    { id: '4', name: 'Loja B' },
    { id: '5', name: 'Depósito Central' },
  ];

  const supplierOptions = [
    { value: 'fornecedor1', label: 'Fornecedor A' },
    { value: 'fornecedor2', label: 'Fornecedor B' },
    { value: 'fornecedor3', label: 'Fornecedor C' },
  ];

  const entryTypeOptions = [
    { value: 'compra', label: 'Compra' },
    { value: 'devolucao', label: 'Devolução' },
    { value: 'ajuste', label: 'Ajuste de Estoque' },
    { value: 'transferencia', label: 'Transferência' },
  ];

  const movementTypes = ['entrada', 'saida', 'transferencia'];

  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setLoading(true);
      try {
        for (const entry of productEntryList.entries) {
          const movementData: StockMovementCreateInput = {
            type: formData.type as 'entrada' | 'saida',
            productId: entry.productId,
            quantity: entry.quantity,
            locationId: formData.locationId || '1',
            userId: 'user-1',
            reason: `${formData.entryType} - Lote: ${entry.batchNumber}`,
            unitPrice: entry.unitPrice,
            totalValue: entry.totalValue,
            notes: formData.notes,
          };

          const result = await createMovement(movementData);
          if (!result) {
            setLoading(false);
            return; 
          }
        }

        handleSuccess('Movimentações registradas com sucesso!');
        resetForm();
        onSuccess?.();
      } catch (error) {
        handleError(error, 'Erro ao registrar movimentações');
      } finally {
        setLoading(false);
      }
    },
    [formData, productEntryList.entries, createMovement, handleError, handleSuccess, onSuccess]
  );

  const resetForm = useCallback(() => {
    setFormData({
      type: initialType || 'entrada',
      productId: '',
      quantity: 0,
      reason: '',
      locationId: '',
      userId: '',
      unitPrice: 0,
      totalValue: 0,
      supplier: '',
      entryType: '',
    });
    setEntryDate(new Date());
    productEntryList.resetEntries();
  }, [initialType, productEntryList]);

  return {
    formData,
    loading,
    entryDate,
    setEntryDate,
    handleChange,
    handleSubmit,
    movementTypes,
    locations,
    supplierOptions,
    entryTypeOptions,
    resetForm,
    productEntryList,
  };
}