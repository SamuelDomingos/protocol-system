import { useState, useCallback } from 'react';
import type { TemplateStageFormData } from '@/src/templates/protocols/types';

export function useStage(initialStages: TemplateStageFormData[] = []) {
  const [stages, setStages] = useState<TemplateStageFormData[]>(initialStages);

  const addStage = useCallback(() => {
    setStages(prevStages => {
      const newStage: TemplateStageFormData = {
        name: '',
        order: prevStages.length + 1,
        value: 0,
        intervalDays: 0,
        kitId: undefined,
      };
      return [...prevStages, newStage];
    });
  }, []);

  const updateStage = useCallback((index: number, updatedStage: Partial<TemplateStageFormData>) => {
    setStages(prevStages => 
      prevStages.map((stage, i) => 
        i === index ? { ...stage, ...updatedStage } : stage
      )
    );
  }, []);

  const removeStage = useCallback((index: number) => {
    setStages(prevStages => {
      const newStages = prevStages.filter((_, i) => i !== index);

      return newStages.map((stage, i) => ({
        ...stage,
        order: i + 1
      }));
    });
  }, []);

  const reorderStages = useCallback((startIndex: number, endIndex: number) => {
    setStages(prevStages => {
      const result = Array.from(prevStages);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result.map((stage, index) => ({
        ...stage,
        order: index + 1
      }));
    });
  }, []);

  const getTotalValue = useCallback((): number => {
    return stages.reduce((total, stage) => {
      const numericValue = parseFloat(String(stage.value)) || 0;
      return total + numericValue;
    }, 0);
  }, [stages]);

  const setStagesData = useCallback((newStages: TemplateStageFormData[] = []) => {
    setStages(newStages);
  }, []);

  return {
    stages,
    addStage,
    updateStage,
    removeStage,
    reorderStages,
    getTotalValue,
    setStagesData
  };
}