import React from 'react';
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
import { ProductEntryList } from '../organelles/ProductEntryList';
import { useMovementForm } from '../../hooks/organelles/useMovementForm';

interface MovementFormProps {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: 'entrada' | 'saida';
}

export function MovementForm({ onSuccess, open, onOpenChange, initialType }: MovementFormProps) {
  const {
    formData,
    loading,
    entryDate,
    setEntryDate,
    handleChange,
    handleSubmit,
    locations,
    supplierOptions,
    entryTypeOptions,
    resetForm,
    productEntryList,
  } = useMovementForm({ onSuccess, initialType });

  const stockLocationOptions = locations.map(location => ({
    value: location.id,
    label: location.name
  }));

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialType === 'saida' ? 'Registrar Saída' : 'Registrar Entrada'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryType">Tipo de Entrada</Label>
              <Combobox
                options={entryTypeOptions}
                value={formData.entryType}
                onValueChange={(value) => handleChange('entryType', value)}
                placeholder="Selecionar tipo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Combobox
                options={supplierOptions}
                value={formData.supplier}
                onValueChange={(value) => handleChange('supplier', value)}
                placeholder="Selecionar fornecedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationId">Local de Estoque</Label>
              <Combobox
                options={stockLocationOptions}
                value={formData.locationId}
                onValueChange={(value) => handleChange('locationId', value)}
                placeholder="Selecionar local"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryDate">Data da Entrada</Label>
              <DatePicker
                date={entryDate}
                onDateChange={setEntryDate}
                placeholder="Selecionar data da entrada"
              />
            </div>
          </div>
          
          <div className="border-t pt-6">
            <ProductEntryList productEntryList={productEntryList} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || productEntryList.entries.length === 0}
            >
              {loading ? 'Salvando...' : 'Salvar Movimentação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}