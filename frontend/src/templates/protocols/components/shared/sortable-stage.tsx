"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { SortableStageProps } from "@/src/templates/protocols/types";

export const SortableStage = ({ 
  stage, 
  index, 
  updateStage, 
  removeStage, 
  mockKits,
  showKitSelection = true,
}: SortableStageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.order || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          <div className={`flex-1 grid grid-cols-1 gap-4 ${showKitSelection ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <div>
              <Label htmlFor={`stage-name-${index}`}>Nome do Estágio</Label>
              <Input
                id={`stage-name-${index}`}
                value={stage.name}
                onChange={(e) => updateStage(index, { name: e.target.value })}
                placeholder="Nome do estágio"
              />
            </div>

            <div>
              <Label htmlFor={`stage-value-${index}`}>Valor (R$)</Label>
              <Input
                id={`stage-value-${index}`}
                type="number"
                value={stage.value}
                onChange={(e) => updateStage(index, { value: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor={`stage-interval-${index}`}>Intervalo (dias)</Label>
              <Input
                id={`stage-interval-${index}`}
                type="number"
                value={stage.intervalDays}
                onChange={(e) => updateStage(index, { intervalDays: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>

            {/* {showKitSelection && (
              <div>
                <Label htmlFor={`stage-kit-${index}`}>Kit</Label>
                <Select
                  value={stage.kitId || ""}
                  onValueChange={(value) => updateStage(index, { kitId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um kit" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockKits.map((kit) => (
                      <SelectItem key={kit.id} value={kit.id}>
                        {kit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )} */}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeStage(index)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};