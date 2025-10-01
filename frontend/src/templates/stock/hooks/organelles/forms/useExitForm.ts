import { useState, useCallback, useMemo } from 'react';
import { useMovements } from '../../molecules/useMovements';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';
import { StockMovementCreateInput } from '@/src/lib/api/types/stock';
import { useSuppliers } from '@/src/templates/config/hooks/useSuppliers';
import { useClients } from '@/src/templates/clients/hooks/useClients';
import { useUsers } from '@/src/templates/users/hooks/atoms/useUsers';

interface UseExitFormProps {
  onSuccess?: () => void;
}

interface ExitFormData {
  exitType: string;
  originId: string;
  destinationId: string;
  reason: string;
  notes?: string;
}

export function useExitForm({ onSuccess }: UseExitFormProps = {}) {
  const [formData, setFormData] = useState<ExitFormData>({
    exitType: '',
    originId: '',
    destinationId: '',
    reason: '',
    notes: '',
  });

  const [exitDate, setExitDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const { createMovement } = useMovements();
  const { handleError, handleSuccess } = useFeedbackHandler();

  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { clients, isLoading: clientsLoading } = useClients();
  const { users, isLoading: usersLoading } = useUsers();

  const exitTypeOptions = [
    { value: 'employee', label: 'Consumo do Funcionário' },
    { value: 'patient', label: 'Consumo do Paciente' },
    { value: 'sector', label: 'Consumo do Setor' },
    { value: 'loan_return', label: 'Devolução do empréstimo' },
    { value: 'donation', label: 'Doação' },
    { value: 'loss', label: 'Perda/Dano' },
    { value: 'expired', label: 'Vencido' },
  ];

  const typesWithoutDestination = ['donation', 'loss', 'expired'];
  const showDestination = !typesWithoutDestination.includes(formData.exitType);

  const getDestinationType = useCallback((exitType: string): 'supplier' | 'user' | 'client' | undefined => {
    switch (exitType) {
      case 'employee':
        return 'user';
      case 'patient':
        return 'client';
      case 'sector':
      case 'loan_return':
        return 'supplier';
      default:
        return undefined;
    }
  }, []);

  const originOptions = useMemo(() => {
    return suppliers
      .filter(supplier => supplier.type === 'unit' && supplier.category === 'estoque')
      .map(unit => ({
        value: unit.id,
        label: unit.name,
      }));
  }, [suppliers]);

  const destinationOptions = useMemo(() => {
    if (formData.exitType === 'employee') {
      return users.map(user => ({
        value: user.id,
        label: `${user.name}`,
      }));
    }
    
    if (formData.exitType === 'patient') {
      return clients.map(client => ({
        value: client.id,
        label: client.name,
      }));
    }

    if (formData.exitType === 'sector') {
      return suppliers
        .map(supplier => ({
          value: supplier.id,
          label: supplier.name,
        }));
    }

    if (formData.exitType === 'loan_return') {
      return suppliers
        .filter(supplier => supplier.type === 'supplier')
        .map(supplier => ({
          value: supplier.id,
          label: supplier.name,
        }));
    }

    return [];
  }, [formData.exitType, users, clients, suppliers]);

  const handleChange = useCallback((field: keyof ExitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleExitTypeChange = useCallback((exitType: string) => {
    setFormData(prev => ({
      ...prev,
      exitType,
      destinationId: '',
    }));
  }, []);

  const handleSubmit = useCallback(
    async (products: any[]) => {
      if (!products || products.length === 0) {
        handleError('Adicione pelo menos um produto');
        return false;
      }

      try {
        setLoading(true);

        const destinationType = getDestinationType(formData.exitType);

        for (const product of products) {
          const movementData: StockMovementCreateInput = {
            type: 'saida',
            productId: product.productId,
            quantity: product.quantity,
            fromLocationId: formData.originId,
            fromLocationType: 'supplier',
            toLocationId: showDestination && formData.destinationId ? formData.destinationId : undefined,
            toLocationType: showDestination && formData.destinationId ? destinationType : undefined,
            userId: 'user-1',
            reason: `${formData.exitType} - Lote: ${product.batchNumber}`,
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

        handleSuccess('Saída registrada com sucesso!');
        onSuccess?.();
        return true;
      } catch (error) {
        handleError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [formData, showDestination, getDestinationType, createMovement, handleError, handleSuccess, onSuccess]
  );

  const resetForm = useCallback(() => {
    setFormData({
      exitType: '',
      originId: '',
      destinationId: '',
      reason: '',
      notes: '',
    });
    setExitDate(new Date());
  }, []);

  return {
    formData,
    exitDate,
    setExitDate,
    loading: loading || suppliersLoading || clientsLoading || usersLoading,
    exitType: formData.exitType,
    exitTypeOptions,
    originOptions,
    destinationOptions,
    showDestination,
    handleChange,
    handleExitTypeChange,
    handleSubmit,
    resetForm,
  };
}