

import { useState } from 'react';
import { useApplication } from '../atoms/useApplication';
import { Application, CreateApplicationRequest, UpdateApplicationRequest } from '@/src/lib/api/types/application';
import { UseApplicationsTemplateConfig, UseApplicationsTemplateReturn } from '../../types/hooks';

export const useApplicationsTemplate = ({
  initialApplications,
  onApplicationCreated,
  onApplicationUpdated,
  onApplicationDeleted,
}: UseApplicationsTemplateConfig): UseApplicationsTemplateReturn => {
  const {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    completeApplication,
  } = useApplication({
    initialData: initialApplications,
    autoFetch: true,
  });

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | undefined>();

  const handleOpenCreateDialog = () => {
    setSelectedApplication(undefined);
    setIsEditing(false);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (application: Application) => {
    setSelectedApplication(application);
    setIsEditing(true);
    setIsFormDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsFormDialogOpen(false);
    setSelectedApplication(undefined);
    setIsEditing(false);
  };

  const handleSubmit = async (data: CreateApplicationRequest | UpdateApplicationRequest) => {
    try {
      let result;
      
      if (isEditing && selectedApplication) {
        result = await updateApplication(selectedApplication.id, data as UpdateApplicationRequest);
        onApplicationUpdated?.(result);
      } else {
        result = await createApplication(data as CreateApplicationRequest);
        onApplicationCreated?.(result);
      }
      
      handleCloseDialog();
      await fetchApplications();
    } catch (error) {
      console.error('Erro ao salvar aplicação:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      onApplicationDeleted?.(id);
      await fetchApplications();
    } catch (error) {
      console.error('Erro ao excluir aplicação:', error);
    }
  };

  const handleView = (application: Application) => {
    setSelectedApplication(application);
    setSelectedApplicationId(application.id);
  };

  const handleSelectApplication = (application: Application) => {
    setSelectedApplicationId(application.id);
    setSelectedApplication(application);
  };

  const handleCompleteApplication = async (id: string) => {
    try {
      await completeApplication(id);
      await fetchApplications();
    } catch (error) {
      console.error('Erro ao completar aplicação:', error);
    }
  };

  const completedApplications = applications.filter(app => app.status === 'completed');
  const pendingApplications = applications.filter(app => app.status !== 'completed');

  return {
    applications,
    loading,
    error,
    isFormDialogOpen,
    selectedApplication,
    isEditing,
    activeTab,
    selectedApplicationId,
    completedApplications,
    pendingApplications,
    
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleCloseDialog,

    handleSubmit,
    handleDelete,
    handleView,
    handleSelectApplication,
    handleCompleteApplication,

    setActiveTab,
    setIsFormDialogOpen,
  };
};