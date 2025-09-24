"use client"

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog";
import { Plus } from "lucide-react";
import { ProtocolsTable, TemplatesTable } from "@/src/templates/protocols";
import { useProtocols } from "@/src/templates/protocols/hooks/use-protocols";
import { useTemplates } from "@/src/templates/protocols/hooks/use-templates";
import { PaginationControls } from "@/src/global/pagination";
import { SearchInput } from "@/src/global/search/components/search-input";
import type { Protocol, ProtocolTemplate } from "@/src/templates/protocols/types";

export default function ProtocolsPage() {
  const [isProtocolDialogOpen, setIsProtocolDialogOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<ProtocolTemplate | undefined>();

  // Usar hooks separados para protocolos e templates
  const { 
    protocols, 
    searchTerm: protocolSearchTerm, 
    setSearchTerm: setProtocolSearchTerm, 
    pagination: protocolPagination, 
    isLoading: isProtocolsLoading, 
    error: protocolsError, 
    deleteProtocol 
  } = useProtocols();
  
  // Hook separado para templates
  const {
    templates,
    searchTerm: templateSearchTerm,
    setSearchTerm: setTemplateSearchTerm,
    pagination: templatePagination,
    isLoading: isTemplatesLoading,
    error: templatesError,
    deleteTemplate
  } = useTemplates();
  
  const openProtocolDialog = (protocol?: Protocol) => {
    setEditingProtocol(protocol);
    setIsProtocolDialogOpen(true);
  };

  const handleUseTemplate = (template: ProtocolTemplate) => {
    setSelectedTemplate(template);
    setIsProtocolDialogOpen(true);
  };

  const resetDialog = () => {
    setIsProtocolDialogOpen(false);
    setEditingProtocol(undefined);
    setSelectedTemplate(undefined);
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
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4">
                        {editingProtocol ? 'Editar Protocolo' : 'Novo Protocolo'}
                      </h3>
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Novo Template
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <TemplatesTable 
                data={templates}
                isLoading={isTemplatesLoading}
                error={templatesError}
                onUseTemplate={handleUseTemplate}
                onEdit={() => {}} // Implementar posteriormente
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