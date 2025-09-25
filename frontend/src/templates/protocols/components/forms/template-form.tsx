"use client";

import { useTemplateForm } from "@/src/templates/protocols/hooks/use-templateForm";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { SortableStagesList } from "@/src/templates/protocols/components/shared/sortable-stages-list";
import { Kit } from "@/src/templates/protocols/types";

interface TemplateFormProps {
  templateId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function TemplateForm({ templateId, onSave, onCancel }: TemplateFormProps) {
  const {
    formData,
    isLoading,
    updateTitle,
    addStage,
    updateStage,
    removeStage,
    reorderStages,
    saveTemplate,
    calculateTotal
  } = useTemplateForm(templateId, {
    onSuccess: onSave
  });

  const mockKits: Kit[] = [
    { id: "1", name: "Kit Básico" },
    { id: "2", name: "Kit Intermediário" },
    { id: "3", name: "Kit Avançado" }
  ];

  if (!formData) {
    return <div>Carregando...</div>;
  }

  const handleSave = async () => {
    await saveTemplate();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {templateId ? "Editar Template" : "Criar Novo Template"}
        </h1>
        <p className="text-gray-600">
          Configure o template de protocolo com seus estágios e valores.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div>
              <Label htmlFor="template-title">Título do Template</Label>
              <Input
                id="template-title"
                value={formData.title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Digite o título do template"
                className="mt-2"
              />
            </div>
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
          isProtocol={false}
          showTotal={true}
          title="Estágios do Template"
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : templateId ? "Atualizar Template" : "Criar Template"}
          </Button>
        </div>
      </form>
    </div>
  );
}