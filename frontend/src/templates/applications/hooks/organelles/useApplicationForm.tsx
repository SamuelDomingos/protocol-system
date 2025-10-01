import { useState, useCallback, useEffect } from 'react';
import { UseApplicationFormConfig, UseApplicationFormReturn } from '../../types/hooks';
import { ApplicationFormData } from '../../types/components';
import { CreateApplicationRequest, UpdateApplicationRequest } from '@/src/lib/api/types/application';

export const useApplicationForm = (config: UseApplicationFormConfig = {}): UseApplicationFormReturn => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    stageId: '',
    appliedAt: undefined,
    clientPhoto: undefined,
    clientSignature: undefined,
    nurseSignature: undefined,
    status: 'applied',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const defaultValidationRules = {
    stageId: (value: string) => !value ? 'Estágio é obrigatório' : null,
    appliedAt: (value: Date | undefined) => !value ? 'Data de aplicação é obrigatória' : null,
  };

  const validationRules = config.validationRules || defaultValidationRules;

  // Validar formulário
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    Object.entries(validationRules).forEach(([field, rule]) => {
      const value = formData[field as keyof ApplicationFormData];
      const error = rule(value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (config.onValidationChange) {
      config.onValidationChange(isValid);
    }

    return isValid;
  }, [formData, validationRules, config]);

  // Atualizar dados do formulário
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Atualizar arquivos
  const handleFileChange = useCallback((field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
    }));
  }, []);

  // Resetar formulário
  const resetForm = useCallback(() => {
    const initialData: ApplicationFormData = {
      stageId: config.initialData?.stageId || '',
      appliedAt: config.initialData?.appliedAt,
      clientPhoto: config.initialData?.clientPhoto,
      clientSignature: config.initialData?.clientSignature,
      nurseSignature: config.initialData?.nurseSignature,
      status: config.initialData?.status || 'applied',
    };

    setFormData(initialData);
    setErrors({});
  }, [config.initialData]);

  // Submeter formulário
  const handleSubmit = useCallback((onSubmit: (data: CreateApplicationRequest | UpdateApplicationRequest) => void) => {
    if (validateForm()) {
      const submitData: CreateApplicationRequest | UpdateApplicationRequest = {
        stageId: formData.stageId,
        appliedAt: formData.appliedAt?.toISOString() || new Date().toISOString(),
        clientSignature: '', // Será preenchido com base64 ou URL do arquivo
        nurseSignature: '', // Será preenchido com base64 ou URL do arquivo
      };

      // Add status only for UpdateApplicationRequest
      if (formData.status) {
        (submitData as UpdateApplicationRequest).status = formData.status;
      }

      if (formData.clientPhoto) {
        submitData.clientPhoto = ''; // Será processado como base64 ou URL
      }

      onSubmit(submitData);
    }
  }, [formData, validateForm]);

  // Inicializar com dados da aplicação se fornecida
  useEffect(() => {
    if (config.application) {
      setFormData({
        stageId: config.application.stageId,
        appliedAt: new Date(config.application.appliedAt),
        status: config.application.status,
        clientPhoto: undefined,
        clientSignature: undefined,
        nurseSignature: undefined,
      });
    } else if (config.initialData) {
      setFormData(prev => ({ ...prev, ...config.initialData }));
    }
  }, [config.application, config.initialData]);

  // Validar quando os dados mudarem
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const isValid = Object.keys(errors).length === 0 && 
                  formData.stageId && 
                  formData.appliedAt;

  return {
    formData,
    errors,
    isValid: Boolean(isValid),
    handleInputChange,
    handleFileChange,
    handleSubmit,
    resetForm,
  };
};