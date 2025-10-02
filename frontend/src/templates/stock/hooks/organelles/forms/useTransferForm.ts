import { useState, useCallback, useMemo } from 'react';
import { useMovements } from '../../atoms/useMovements';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import { StockMovementCreateInput } from '@/src/lib/api/types/stock';
import { useSuppliers } from '@/src/templates/config/hooks/useSuppliers';

interface UseTransferFormProps {
  onSuccess?: () => void;
}

interface TransferFormData {
  originId: string;
  destinationId: string;
  notes?: string;
}

export function useTransferForm({ onSuccess }: UseTransferFormProps = {}) {
  const [formData, setFormData] = useState<TransferFormData>({
    originId: '',
    destinationId: '',
    notes: '',
  });

  const [transferDate, setTransferDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const { createMovement } = useMovements();
  const { handleError, handleSuccess } = useFeedbackHandler();

  const { suppliers, loading: suppliersLoading } = useSuppliers();

  const stockOptions = useMemo(() => {
    return suppliers
      .filter(supplier => supplier.type === 'unit' && supplier.category === 'estoque')
      .map(unit => ({
        value: unit.id,
        label: unit.name,
      }));
  }, [suppliers]);

  const destinationOptions = useMemo(() => {
    return stockOptions.filter(option => option.value !== formData.originId);
  }, [stockOptions, formData.originId]);

  const handleChange = useCallback((field: keyof TransferFormData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === 'originId' && prev.destinationId === value ? { destinationId: '' } : {})
    }));
  }, []);

  const handleSubmit = useCallback(
    async (products: any[]) => {
      if (!products || products.length === 0) {
        handleError('Adicione pelo menos um produto');
        return false;
      }

      if (!formData.originId) {
        handleError('Selecione a origem da transferência');
        return false;
      }

      if (!formData.destinationId) {
        handleError('Selecione o destino da transferência');
        return false;
      }

      try {
        setLoading(true);

        for (const product of products) {
          const movementData: StockMovementCreateInput = {
            type: 'transferencia',
            productId: product.productId,
            quantity: product.quantity,
            fromLocationId: formData.originId,
            fromLocationType: 'supplier',
            toLocationId: formData.destinationId,
            toLocationType: 'supplier',
            userId: 'user-1',
            reason: `Transferência`,
            unitPrice: product.unitPrice,
            totalValue: product.totalValue,
            notes: formData.notes,
            sku: product.batchNumber,
            expiryDate: product.expiryDate,
          };

          const result = await createMovement(movementData);
          if (!result) {
            setLoading(false);
            return false;
          }
        }

        handleSuccess('Transferência registrada com sucesso!');
        onSuccess?.();
        return true;
      } catch (error) {
        handleError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [formData, createMovement, handleError, handleSuccess, onSuccess]
  );

  const resetForm = useCallback(() => {
    setFormData({
      originId: '',
      destinationId: '',
      notes: '',
    });
    setTransferDate(new Date());
  }, []);

  return {
    formData,
    transferDate,
    setTransferDate,
    loading: loading || suppliersLoading,
    stockOptions,
    destinationOptions,
    handleChange,
    handleSubmit,
    resetForm,
  };
}