import { useState, useEffect, useCallback } from 'react';
import { useProducts } from '../../atoms/useProducts';
import { ProductCreateInput, ProductUpdateInput, Product } from '../../../types';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';

interface UseProductFormProps {
  initialData?: Product;
  onSuccess?: (product: Product) => void;
}

export function useProductForm({ initialData, onSuccess }: UseProductFormProps = {}) {
  const [formData, setFormData] = useState<ProductCreateInput | ProductUpdateInput>( initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const [loading, setLoading] = useState(false);
  const { createProduct, updateProduct } = useProducts();
  const { handleError, handleSuccess } = useFeedbackHandler();

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      let result;

      if (initialData?.id) {
        const { id, createdAt, updatedAt, ...dataToUpdate } = formData;
        result = await updateProduct(initialData.id, dataToUpdate as ProductUpdateInput);
        if (result) {
          handleSuccess('Produto atualizado com sucesso!');
        }
      } else {
        result = await createProduct(formData as ProductCreateInput);
        if (result) {
          handleSuccess('Produto criado com sucesso!');
        }
      }

      if (result && onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      handleError(error, initialData ? 'Erro ao atualizar produto' : 'Erro ao criar produto');
      return null;
    } finally {
      setLoading(false);
    }
  }, [formData, initialData, createProduct, updateProduct, onSuccess, handleError, handleSuccess]);

  const resetForm = useCallback(() => {
    setFormData(
      initialData || {
        name: '',
        description: '',
        category: '',
        minimumStock: 0,
        status: 'active',
        unit: '',
      }
    );
  }, [initialData]);

  return {
    formData,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
    isEditing: !!initialData?.id,
  };
}