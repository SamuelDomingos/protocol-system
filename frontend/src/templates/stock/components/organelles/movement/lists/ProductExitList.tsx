import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Combobox } from '@/src/global/combobox/components/combobox';
import { Trash2, Plus } from 'lucide-react';
import { useExitProductList } from '../../../../hooks/organelles/lists/useProductExitList';
import { BatchDialog } from '../../BatchDialog';
import { ExitProductListProps, BatchInfo } from '../../../../types/components';

export function ProductExitList({ 
  locationId, 
  entries, 
  onEntriesChange,
  exitType 
}: ExitProductListProps) {
  const {
    filteredProducts,
    getMaxQuantityForProduct,
    getBatchesForProduct,
    loading,
    addNewEntry,
    removeEntry,
    updateEntry,
    selectProduct,
    selectBatch,
  } = useExitProductList({ 
    locationId, 
    entries, 
    onEntriesChange,
    exitType 
  });

  const showDestination = ['employee', 'patient', 'sector', 'loan_return'].includes(exitType);

  const handleBatchSelect = (index: number, batchInfo: BatchInfo) => {
    selectBatch(index, batchInfo);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Produtos</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewEntry}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum produto adicionado
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const maxQuantity = getMaxQuantityForProduct(entry.productId);
            const hasQuantityError = entry.quantity > maxQuantity;
            const batches = getBatchesForProduct(entry.productId);

            return (
              <div key={entry.id} className="border rounded-lg p-4 bg-card">
                <div className={`grid gap-4 ${showDestination ? 'grid-cols-1 md:grid-cols-8' : 'grid-cols-1 md:grid-cols-7'}`}>
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor={`product-${entry.id}`}>Produto *</Label>
                    <Combobox
                      options={filteredProducts}
                      value={entry.productId}
                      onValueChange={(value) => selectProduct(index, value)}
                      placeholder="Selecionar produto"
                      disabled={loading}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <Label>Estoque Atual</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-muted-foreground">
                      <span className="text-sm">{maxQuantity}</span>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <Label htmlFor={`quantity-${entry.id}`}>Qtd. Saída *</Label>
                    <Input
                      id={`quantity-${entry.id}`}
                      type="number"
                      min="0"
                      max={maxQuantity}
                      value={entry.quantity || ''}
                      onChange={(e) => updateEntry(index, 'quantity', Number(e.target.value))}
                      className={hasQuantityError ? 'border-destructive' : ''}
                    />
                    {hasQuantityError && (
                      <p className="text-sm text-destructive mt-1">
                        Máximo: {maxQuantity}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <Label>Lote</Label>
                    <div className="flex gap-2">
                      <Input
                        value={entry.batchNumber || ''}
                        readOnly
                        placeholder="Selecione um lote"
                        className="bg-muted/50 text-muted-foreground flex-1"
                      />
                      <BatchDialog
                        productId={entry.productId}
                        batches={batches}
                        onBatchSelect={(batch) => handleBatchSelect(index, batch)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <Label>Validade</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-muted-foreground">
                      <span className="text-sm">
                        {entry.expiryDate ? entry.expiryDate.toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEntry(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}