'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Plus, Calendar, Users, FileText, CheckCircle } from 'lucide-react';
import ApplicationList from './components/atoms/applicationList';
import ApplicationPascientsList from './components/molecules/applicationPascientsList';
import ApplicationForm from './components/organelles/applicationForm';
import { useApplicationsTemplate } from './hooks/molecules/usehookTemplate';
import { ApplicationsTemplateProps } from './types/components';

const ApplicationsTemplate: React.FC<ApplicationsTemplateProps> = ({
  initialApplications,
  onApplicationCreated,
  onApplicationUpdated,
  onApplicationDeleted,
}) => {
  const {
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
  } = useApplicationsTemplate({
    initialApplications,
    onApplicationCreated,
    onApplicationUpdated,
    onApplicationDeleted,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Gerenciamento de Aplicações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie aplicações de protocolos e acompanhe o progresso dos pacientes
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nova Aplicação
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{pendingApplications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">{completedApplications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pacientes</p>
              <p className="text-2xl font-bold">
                {new Set(applications.map(app => `patient-${app.id.slice(0, 8)}`)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Lista de Aplicações
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Por Paciente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <ApplicationList
            applications={applications}
            onEdit={handleOpenEditDialog}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <ApplicationPascientsList
            applications={applications}
            onSelectApplication={handleSelectApplication}
            selectedApplicationId={selectedApplicationId}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default ApplicationsTemplate;