"use client";

import { useProtocolForm } from "@/src/templates/protocols/hooks/organelles/use-protocolForm";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { SortableStagesList } from "@/src/templates/protocols/components/shared/sortable-stages-list";
import { Kit, Protocol } from "@/src/templates/protocols/types";
import { Combobox } from "@/src/global/combobox/components/combobox";
import { useClients } from "@/src/templates/clients/hooks/useClients";
import { useTemplates } from "@/src/templates/protocols/hooks/molecules/use-templates";
import { Input } from "@/src/components/ui/input";

interface ProtocolFormProps {
  protocol?: Protocol;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ProtocolForm({
  protocol,
  onSave,
  onCancel,
}: ProtocolFormProps) {
  const {
    formData,
    isLoading,
    updateClientId,
    selectTemplate,
    addStage,
    updateStage,
    removeStage,
    reorderStages,
    saveProtocol,
    calculateTotal,
    updateTitle,
  } = useProtocolForm(protocol, {
    onSuccess: onSave,
  });

  const { clients, isLoading: isLoadingClients } = useClients();
  const { templates, isLoading: isLoadingTemplates } = useTemplates();

  const mockKits: Kit[] = [
    { id: "1", name: "Kit Básico" },
    { id: "2", name: "Kit Intermediário" },
    { id: "3", name: "Kit Avançado" },
  ];

  const clientOptions = clients.map((client) => ({
    value: String(client.id),
    label: client.name,
  }));

  const templateOptions = templates.map((template) => ({
    value: String(template.id),
    label: template.title,
  }));

  if (!formData) {
    return <div>Carregando...</div>;
  }

  const handleSave = async () => {
    await saveProtocol();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {protocol?.id ? "Editar Protocolo" : "Criar Novo Protocolo"}
        </h1>
        <p className="text-gray-600">
          Configure o protocolo com seus estágios e valores.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Cliente</Label>
              <Combobox
                value={String(formData.clientId)}
                onValueChange={updateClientId}
                options={clientOptions}
                placeholder="Selecione um cliente..."
                isLoading={isLoadingClients}
                disabled={!!protocol}
              />
            </div>

            {protocol ? (
              <div>
                <Label>Título do Protocolo</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  placeholder="Título do Protocolo"
                />
              </div>
            ) : ( 
              <div>
                <Label>Template</Label>
                <Combobox
                  value={formData.templateId}
                  onValueChange={selectTemplate}
                  options={templateOptions}
                  placeholder="Selecione um template..."
                  isLoading={isLoadingTemplates}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <SortableStagesList
          stages={formData.stages}
          updateStage={updateStage}
          removeStage={removeStage}
          reorderStages={reorderStages}
          addStage={addStage}
          calculateTotal={calculateTotal}
          mockKits={mockKits}
          showKitSelection={true}
          isProtocol={true}
          showTotal={true}
          title="Estágios do Protocolo"
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Salvando..."
              : protocol?.id
              ? "Atualizar Protocolo"
              : "Criar Protocolo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
