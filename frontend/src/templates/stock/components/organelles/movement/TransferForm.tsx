import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Combobox } from '@/src/global/combobox/components/combobox';
import { DatePicker } from '@/src/components/ui/date-picker';
import { ProductTransferList } from '../ProductTransferList';
import { useTransferForm } from '../../../hooks/organelles/forms/useTransferForm';
import { TransferProductEntry } from '../../../types/hooks';

interface TransferFormProps {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferForm({ onSuccess, open, onOpenChange }: TransferFormProps) {
  const {
    formData,
    loading,
    transferDate,
    setTransferDate,
    stockOptions,
    destinationOptions,
    handleChange,
    handleSubmit,
    resetForm,
  } = useTransferForm({ onSuccess });

  const [products, setProducts] = useState<TransferProductEntry[]>([]);

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
    setProducts([]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productsForSubmit = products.filter(p => p.transferQuantity > 0).map(product => ({
      productId: product.productId,
      quantity: product.transferQuantity,
      batchNumber: product.batchNumber,
      expiryDate: product.expiryDate,
      unitPrice: product.unitPrice,
      totalValue: product.unitPrice * product.transferQuantity,
    }));

    const success = await handleSubmit(productsForSubmit);
    if (success) {
      handleClose();
    }
    return success;
  };

  const hasValidProducts = products.some(p => 
    p.transferQuantity > 0 && p.transferQuantity <= p.availableQuantity
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Transferência</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Estoque de Origem *</Label>
              <Combobox
                options={stockOptions}
                value={formData.originId}
                onValueChange={(value) => handleChange('originId', value ?? '')}
                placeholder="Selecionar origem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Estoque de Destino *</Label>
              <Combobox
                options={destinationOptions}
                value={formData.destinationId}
                onValueChange={(value) => handleChange('destinationId', value ?? '')}
                placeholder="Selecionar destino"
                disabled={!formData.originId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferDate">Data da Transferência *</Label>
              <DatePicker
                date={transferDate}
                onDateChange={(date) => date && setTransferDate(date)}
                placeholder="Selecionar data da transferência"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações sobre a transferência (opcional)"
              rows={3}
            />
          </div>
          
          {formData.originId && (
            <div className="border-t pt-6">
              <ProductTransferList
                locationId={formData.originId}
                entries={products}
                onEntriesChange={setProducts}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !hasValidProducts || !formData.originId || !formData.destinationId}
            >
              {loading ? 'Salvando...' : 'Salvar Transferência'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}