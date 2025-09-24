"use client";

import { useState } from "react";
import { useTemplateForm } from "../hooks/use-template-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { formatCurrency } from "@/src/lib/utils";
import { TemplateStageFormData } from "../types/template-form";

interface TemplateFormProps {
  templateId?: string;
}

interface Kit {
  id: string;
  name: string;
}

interface SortableStageProps {
  stage: TemplateStageFormData;
  index: number;
  updateStage: (index: number, data: Partial<TemplateStageFormData>) => void;
  removeStage: (index: number) => void;
  mockKits: Kit[];
}

const SortableStage = ({ stage, index, updateStage, removeStage, mockKits }: SortableStageProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `stage-${index}`,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="border mb-3">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor={`stageName-${index}`}>Nome do Estágio</Label>
              <Input
                id={`stageName-${index}`}
                placeholder="Nome do estágio"
                value={stage.name}
                onChange={(e) => updateStage(index, { name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor={`stageValue-${index}`}>Valor (R$)</Label>
              <Input
                id={`stageValue-${index}`}
                type="number"
                placeholder="0"
                value={stage.value || ""}
                onChange={(e) => updateStage(index, { value: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <Label htmlFor={`stageInterval-${index}`}>Intervalo (dias)</Label>
              <Input
                id={`stageInterval-${index}`}
                type="number"
                placeholder="0"
                value={stage.intervalDays || ""}
                onChange={(e) => updateStage(index, { intervalDays: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <Label htmlFor={`stageKit-${index}`}>Kit</Label>
              <Select
                value={stage.kitId}
                onValueChange={(value) => updateStage(index, { kitId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um kit" />
                </SelectTrigger>
                <SelectContent>
                  {mockKits.map((kit: Kit) => (
                    <SelectItem key={kit.id} value={kit.id}>
                      {kit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeStage(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export function TemplateForm({ templateId }: TemplateFormProps) {
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
  } = useTemplateForm(templateId);

  // Mock de kits para seleção (será implementado posteriormente)
  const mockKits: Kit[] = [
    { id: "1", name: "Kit Básico" },
    { id: "2", name: "Kit Intermediário" },
    { id: "3", name: "Kit Avançado" }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const activeIndex = parseInt(active.id.split('-')[1]);
      const overIndex = parseInt(over.id.split('-')[1]);
      
      reorderStages(activeIndex, overIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="templateName">Nome do Modelo</Label>
        <Input
          id="templateName"
          placeholder="Nome do modelo de protocolo"
          value={formData.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="max-w-xl"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Estágios</h3>
          <Button onClick={addStage} variant="outline">
            + Adicionar Estágio
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={formData.stages.map((_, index) => `stage-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            {formData.stages.map((stage, index) => (
              <SortableStage
                key={`stage-${index}`}
                stage={stage}
                index={index}
                updateStage={updateStage}
                removeStage={removeStage}
                mockKits={mockKits}
              />
            ))}
          </SortableContext>
        </DndContext>

        {formData.stages.length === 0 && (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">Nenhum estágio adicionado</p>
            <Button onClick={addStage} variant="link" className="mt-2">
              Adicionar estágio
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-lg font-medium">
          Valor Total: <span className="font-bold">{formatCurrency(calculateTotal())}</span>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button onClick={saveTemplate} disabled={isLoading}>
            {isLoading ? "Salvando..." : templateId ? "Atualizar Modelo" : "Salvar Modelo"}
          </Button>
        </div>
      </div>
    </div>
  );
}