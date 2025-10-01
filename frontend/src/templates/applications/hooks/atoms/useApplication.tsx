import { useState, useEffect, useCallback } from 'react';
import { 
  getApplications, 
  getApplicationById, 
  createApplication, 
  createApplicationWithFile,
  updateApplication, 
  deleteApplication,
  getApplicationsByStage,
  completeApplication
} from '@/src/lib/api/applications';
import { Application, CreateApplicationRequest, UpdateApplicationRequest } from '@/src/lib/api/types/application';
import { UseApplicationReturn, UseApplicationConfig } from '../../types/hooks';
import { useFeedbackHandler } from '@/src/hooks/useFeedbackHandler';

export function useApplication(config?: UseApplicationConfig): UseApplicationReturn {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { handleError, handleSuccess } = useFeedbackHandler();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getApplications();
      setApplications(response.applications);
      setError(null);
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao buscar aplicações');
      setError(errorMessage);
      config?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createApplicationHandler = useCallback(async (data: CreateApplicationRequest): Promise<Application> => {
    try {
      setLoading(true);
      setError(null);
      const newApplication = await createApplication(data);
      setApplications(prev => [newApplication, ...prev]);
      handleSuccess('Aplicação criada com sucesso!');
      config?.onSuccess?.('Aplicação criada com sucesso!');
      return newApplication;
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao criar aplicação');
      setError(errorMessage);
      config?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const createApplicationWithFileHandler = useCallback(async (data: CreateApplicationRequest, files: { [key: string]: File }): Promise<Application> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('stageId', data.stageId);
      if (data.appliedAt) {
        formData.append('appliedAt', data.appliedAt);
      }
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });
      
      const newApplication = await createApplicationWithFile(formData);
      setApplications(prev => [newApplication, ...prev]);
      handleSuccess('Aplicação criada com sucesso!');
      config?.onSuccess?.('Aplicação criada com sucesso!');
      return newApplication;
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao criar aplicação com arquivo');
      setError(errorMessage);
      config?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const updateApplicationHandler = useCallback(async (id: string, data: UpdateApplicationRequest): Promise<Application> => {
    try {
      setLoading(true);
      setError(null);
      const updatedApplication = await updateApplication(id, data);
      setApplications(prev => prev.map(app => app.id === id ? updatedApplication : app));
      handleSuccess('Aplicação atualizada com sucesso!');
      config?.onSuccess?.('Aplicação atualizada com sucesso!');
      return updatedApplication;
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao atualizar aplicação');
      setError(errorMessage);
      config?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const deleteApplicationHandler = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      handleSuccess('Aplicação excluída com sucesso!');
      config?.onSuccess?.('Aplicação excluída com sucesso!');
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao excluir aplicação');
      setError(errorMessage);
      config?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const getApplicationByIdHandler = useCallback(async (id: string): Promise<Application> => {
    try {
      setLoading(true);
      setError(null);
      const application = await getApplicationById(id);
      return application;
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao carregar aplicação');
      setError(errorMessage);
      config?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getApplicationsByStageHandler = useCallback(async (stageId: string): Promise<Application[]> => {
    try {
      setLoading(true);
      setError(null);
      const applications = await getApplicationsByStage(stageId);
      return applications;
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao carregar aplicações por estágio');
      setError(errorMessage);
      config?.onError?.(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const completeApplicationHandler = useCallback(async (id: string): Promise<Application> => {
    try {
      setLoading(true);
      setError(null);
      const completedApplication = await completeApplication(id);
      setApplications(prev => prev.map(app => app.id === id ? completedApplication.application : app));
      handleSuccess('Aplicação concluída com sucesso!');
      config?.onSuccess?.('Aplicação concluída com sucesso!');
      return completedApplication.application;
    } catch (err) {
      const errorMessage = handleError(err, 'Erro ao concluir aplicação');
      setError(errorMessage);
      config?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  useEffect(() => {
    if (config?.autoFetch !== false) {
      fetchApplications();
    }
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication: createApplicationHandler,
    createApplicationWithFile: createApplicationWithFileHandler,
    updateApplication: updateApplicationHandler,
    deleteApplication: deleteApplicationHandler,
    getApplicationById: getApplicationByIdHandler,
    getApplicationsByStage: getApplicationsByStageHandler,
    completeApplication: completeApplicationHandler,
  };
}