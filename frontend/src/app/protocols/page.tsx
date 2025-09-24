"use client"

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Plus } from "lucide-react";
import { ProtocolsTable, TemplatesTable } from "@/src/templates/protocols";
import { TemplateForm } from "@/src/templates/protocols/components/template-form";
import { useProtocols } from "@/src/templates/protocols/hooks/use-protocols";
import { useTemplates } from "@/src/templates/protocols/hooks/use-templates";
import { PaginationControls } from "@/src/global/pagination";
import { SearchInput } from "@/src/global/search/components/search-input";
import type { Protocol, ProtocolTemplate } from "@/src/templates/protocols/types";

export default function ProtocolsPage() {
  const [isProtocolDialogOpen, setIsProtocolDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | undefined>();
  const [editingTemplate, setEditingTemplate] = useState<ProtocolTemplate | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<ProtocolTemplate | undefined>();

  // Usar hooks separados para protocolos e templates
  const { 
    protocols, 
    searchTerm: protocolSearchTerm, 
    setSearchTerm: setProtocolSearchTerm, 
    pagination: protocolPagination, 
    isLoading: isProtocolsLoading, 
    error: protocolsError, 
    deleteProtocol,
    loadProtocols
  } = useProtocols();
  
  // Hook separado para templates
  const {
    templates,
    searchTerm: templateSearchTerm,
    setSearchTerm: setTemplateSearchTerm,
    pagination: templatePagination,
    isLoading: isTemplatesLoading,
    error: templatesError,
    deleteTemplate,
    loadTemplates
  } = useTemplates();
  
  const openProtocolDialog = (protocol?: Protocol) => {
    setEditingProtocol(protocol);
    setIsProtocolDialogOpen(true);
  };

  const openTemplateDialog = (template?: ProtocolTemplate) => {
    setEditingTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const handleUseTemplate = (template: ProtocolTemplate) => {
    setSelectedTemplate(template);
    setIsProtocolDialogOpen(true);
  };

  const handleEditTemplate = (template: ProtocolTemplate) => {
    openTemplateDialog(template);
  };

  const resetProtocolDialog = () => {
    setIsProtocolDialogOpen(false);
    setEditingProtocol(undefined);
    setSelectedTemplate(undefined);
  };

  const resetTemplateDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(undefined);
    // Recarregar templates após salvar
    loadTemplates();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Protocolos</h1>
        <p className="text-muted-foreground">
          Gerencie protocolos de pacientes e templates para novos protocolos.
        </p>
      </div>

      <Tabs defaultValue="protocols" className="space-y-4">
        <TabsList>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Protocolos dos Pacientes</CardTitle>
              <div className="flex gap-2">
                <SearchInput
                  value={protocolSearchTerm}
                  onChange={setProtocolSearchTerm}
                  placeholder="Buscar protocolo..."
                  className="w-[250px]"
                />
                <Dialog open={isProtocolDialogOpen} onOpenChange={setIsProtocolDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openProtocolDialog()}>
                      <Plus className="mr-2 h-4 w-4" /> Novo Protocolo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProtocol ? 'Editar Protocolo' : 'Novo Protocolo'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                      <p className="text-muted-foreground">
                        Formulário de protocolo será implementado aqui.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <ProtocolsTable 
                data={protocols}
                isLoading={isProtocolsLoading}
                error={protocolsError}
                onEdit={openProtocolDialog}
                onDelete={deleteProtocol}
              />
            </CardContent>

            <CardFooter className="border-t pt-6">
              <PaginationControls 
                pagination={protocolPagination}
                showItemsPerPage={true}
                className="w-full"
              />
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Templates de Protocolos</CardTitle>
              <div className="flex gap-2">
                <SearchInput
                  value={templateSearchTerm}
                  onChange={setTemplateSearchTerm}
                  placeholder="Buscar template..."
                  className="w-[250px]"
                />
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openTemplateDialog()}>
                      <Plus className="mr-2 h-4 w-4" /> Novo Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTemplate ? 'Editar Template' : 'Novo Template'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-6">
                      <TemplateForm 
                        templateId={editingTemplate?.id}
                        onSave={resetTemplateDialog}
                        onCancel={resetTemplateDialog}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <TemplatesTable 
                data={templates}
                isLoading={isTemplatesLoading}
                error={templatesError}
                onUseTemplate={handleUseTemplate}
                onEdit={handleEditTemplate}
                onDelete={deleteTemplate}
              />
            </CardContent>

            <CardFooter className="border-t pt-6">
              <PaginationControls 
                pagination={templatePagination}
                showItemsPerPage={true}
                className="w-full"
              />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}