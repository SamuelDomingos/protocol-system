"use client";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { formatCurrency } from "@/src/lib/utils";
import { SortableStage } from "./sortable-stage";
import { SortableStagesListProps } from "@/src/templates/protocols/types";

export const SortableStagesList = ({
  stages,
  updateStage,
  removeStage,
  reorderStages,
  addStage,
  calculateTotal,
  mockKits,
  showKitSelection = true,
  isProtocol = false,
  showTotal = true,
  title = "Estágios do Protocolo"
}: SortableStagesListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stages.findIndex(stage => 
        (stage.order || stages.indexOf(stage)) === active.id
      );
      const newIndex = stages.findIndex(stage => 
        (stage.order || stages.indexOf(stage)) === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderStages(oldIndex, newIndex);
      }
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button type="button" onClick={addStage} variant="outline">
            Adicionar Estágio
          </Button>
        </div>

        {stages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum estágio adicionado. Clique em "Adicionar Estágio" para começar.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stages.map((stage, index) => stage.order || index)}
              strategy={verticalListSortingStrategy}
            >
              {stages.map((stage, index) => (
                <SortableStage
                  key={stage.order || index}
                  stage={stage}
                  index={index}
                  updateStage={updateStage}
                  removeStage={removeStage}
                  mockKits={mockKits}
                  showKitSelection={showKitSelection}
                  isProtocol={isProtocol}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {showTotal && stages.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {isProtocol ? "Total do Protocolo:" : "Total do Template:"}
              </span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};