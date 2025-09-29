import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { Combobox } from '@/src/global/combobox/components/combobox';
import { DatePicker } from '@/src/components/ui/date-picker';
import { ProductExitList } from '../ProductExitList';
import { useExitForm } from '../../../hooks/organelles/forms/useExitForm';
import { ProductEntry } from '../../../types';

interface ExitFormProps {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExitForm({ onSuccess, open, onOpenChange }: ExitFormProps) {
  const {
    formData,
    loading,
    exitDate,
    setExitDate,
    exitType,
    exitTypeOptions,
    originOptions,
    showDestination,
    destinationOptions,
    handleChange,
    handleExitTypeChange,
    handleSubmit,
    resetForm,
  } = useExitForm({ onSuccess });

  const [products, setProducts] = useState<ProductEntry[]>([]);

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
    setProducts([]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e, products);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Saída</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exitType">Tipo de Saída *</Label>
              <Combobox
                options={exitTypeOptions}
                value={exitType}
                onValueChange={handleExitTypeChange}
                placeholder="Selecionar tipo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitDate">Data da Saída *</Label>
              <DatePicker
                date={exitDate}
                onDateChange={setExitDate}
                placeholder="Selecionar data da saída"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origem *</Label>
              <Combobox
                options={originOptions}
                value={formData.unit || formData.originId}
                onValueChange={(value) => handleChange('unit', value)}
                placeholder="Selecionar origem"
              />
            </div>

            {showDestination && (
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Combobox
                  options={destinationOptions}
                  value={formData.supplier || formData.destinationId}
                  onValueChange={(value) => handleChange('supplier', value)}
                  placeholder="Selecionar destino"
                />
              </div>
            )}
          </div>
          
          {(formData.unit || formData.originId) && (
            <div className="border-t pt-6">
              <ProductExitList
                locationId={formData.unit || formData.originId}
                entries={products}
                onEntriesChange={setProducts}
                exitType={exitType}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || products.length === 0}
            >
              {loading ? 'Salvando...' : 'Salvar Saída'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}