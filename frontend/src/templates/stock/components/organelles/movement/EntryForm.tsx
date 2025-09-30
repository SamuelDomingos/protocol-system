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
import { ProductEntryList } from '../ProductEntryList';
import { useMovementForm } from '../../../hooks/organelles/forms/useEntryForm';
import { useSuppliers } from '@/src/templates/config/hooks/useSuppliers';
import { EntryFormProps } from '../../../types/components';

export function EntryForm({ onSuccess, open, onOpenChange }: EntryFormProps) {
  const {
    formData,
    loading,
    entryDate,
    setEntryDate,
    handleChange,
    handleSubmit,
    entryTypeOptions,
    resetForm,
    productEntryList,
  } = useMovementForm({ onSuccess, initialType: 'entrada' });

  const { suppliers } = useSuppliers();

  const supplierOptions = suppliers
    .filter(supplier => supplier.type === 'supplier')
    .map(supplier => ({
      value: supplier.id,
      label: supplier.name
    }));

  const unitOptions = suppliers
    .filter(supplier => supplier.type === 'unit' && supplier.category === 'estoque')
    .map(unit => ({
      value: unit.id,
      label: unit.name
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
          <DialogTitle>Registrar Entrada</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryType">Tipo de Entrada *</Label>
              <Combobox
                options={entryTypeOptions}
                value={formData.entryType}
                onValueChange={(value) => handleChange('entryType', value)}
                placeholder="Selecionar tipo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor *</Label>
              <Combobox
                options={supplierOptions}
                value={formData.supplier}
                onValueChange={(value) => handleChange('supplier', value)}
                placeholder="Selecionar fornecedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Estoque *</Label>
              <Combobox
                options={unitOptions}
                value={formData.unit}
                onValueChange={(value) => handleChange('unit', value)}
                placeholder="Selecionar estoque"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryDate">Data da Entrada *</Label>
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
              {loading ? 'Salvando...' : 'Salvar Entrada'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}