import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !productId || batches.length === 0}
          className="h-8 w-8 p-0"
        >
          <Package className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Selecionar Lote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {batches.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum lote disponível para este produto
            </p>
          ) : (
            <div className="grid gap-2">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onBatchSelect(batch)}
                >
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div>
                      <Label className="text-sm font-medium">Lote</Label>
                      <p className="text-sm text-muted-foreground">{batch.sku}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Quantidade</Label>
                      <p className="text-sm text-muted-foreground">{batch.quantity}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Validade</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(batch.expiryDate)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Preço</Label>
                      <p className="text-sm text-muted-foreground">{formatCurrency(batch.price)}</p>
                    </div>
                    <div>
                      <Button size="sm" className="w-full">
                        Selecionar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}