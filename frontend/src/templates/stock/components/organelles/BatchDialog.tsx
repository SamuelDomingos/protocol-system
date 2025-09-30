import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Package } from 'lucide-react';
import { formatCurrency, formatDate } from '@/src/lib/utils';

interface BatchInfo {
  id: string;
  sku: string;
  quantity: number;
  expiryDate?: string;
  price: number;
  product: {
    name: string;
    unitPrice: number;
  };
}

interface BatchDialogProps {
  productId: string;
  batches: BatchInfo[];
  onBatchSelect: (batch: BatchInfo) => void;
  disabled?: boolean;
}

export function BatchDialog({ 
  productId, 
  batches, 
  onBatchSelect, 
  disabled = false 
}: BatchDialogProps) {
  const [open, setOpen] = useState(false);

  const handleBatchSelect = (batch: BatchInfo) => {
    onBatchSelect(batch);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !productId || batches.length === 0}
          className="h-8 w-8 p-0"
        >
          <Package className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4">
          <h4 className="font-medium text-sm mb-3">Selecionar Lote</h4>
          {batches.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              Nenhum lote disponível para este produto
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleBatchSelect(batch)}
                >
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Lote</Label>
                      <p className="text-sm font-medium truncate">{batch.sku}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Qtd</Label>
                      <p className="text-sm font-medium truncate">{batch.quantity}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Validade</Label>
                      <p className="text-sm truncate">
                        {batch.expiryDate ? formatDate(batch.expiryDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Preço</Label>
                      <p className="text-sm truncate">{formatCurrency(batch.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}