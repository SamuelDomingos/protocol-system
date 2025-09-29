import { useState, useCallback } from 'react';
import { useMovements } from '../../molecules/useMovements';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import { StockMovementCreateInput } from '../../../types';
import { useProductEntryList } from '../lists/useProductEntryList';

interface UseMovementFormProps {
  onSuccess?: () => void;
  initialType?: 'entrada' | 'saida' | 'transferencia';
}

export function useMovementForm({ onSuccess, initialType }: UseMovementFormProps = {}) {
  const [formData, setFormData] = useState<Partial<StockMovementCreateInput> & { 
    supplier?: string;
    entryType?: string;
    unit?: string;
  }>({
    type: initialType || 'entrada',
    supplier: '',
    entryType: '',
    productId: '',
    quantity: 0,
    fromLocationId: '',
    toLocationId: '',
    unit: '',
    userId: '',
    reason: '',
    unitPrice: 0,
    totalValue: 0,
  });

  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());

  const productEntryList = useProductEntryList();

  const { createMovement } = useMovements();
  const { handleError, handleSuccess } = useFeedbackHandler();
  const [loading, setLoading] = useState(false);

  const entryTypeOptions = [
    { value: 'compra', label: 'Compra' },
    { value: 'doacao', label: 'Doação' },
    { value: 'transferencia', label: 'Transferência' },
    { value: 'devolucao', label: 'Devolução' },
    { value: 'ajuste', label: 'Ajuste de Estoque' },
  ];

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
            fromLocationId: formData.type === 'entrada' ? formData.supplier : formData.unit,
            toLocationId: formData.type === 'entrada' ? formData.unit : formData.supplier,
            locationId: formData.unit || '',
            userId: 'user-1',
            reason: `${formData.entryType} - Lote: ${entry.batchNumber}`,
            unitPrice: entry.unitPrice,
            totalValue: entry.totalValue,
            notes: formData.notes,
            sku: entry.batchNumber,
            expiryDate: entry.expiryDate,
          };

          const result = await createMovement(movementData);
          if (!result) {
            setLoading(false);
            return; 
          }
        }

        handleSuccess('Movimentação registrada com sucesso!');
        resetForm();
        onSuccess?.();
      } catch (error) {
        handleError(error, 'Erro ao registrar movimentação');
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
      fromLocationId: '',
      toLocationId: '',
      unit: '',
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
    entryTypeOptions,
    resetForm,
    productEntryList,
  };
}