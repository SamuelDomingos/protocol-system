import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Combobox } from '@/src/global/combobox/components/combobox';
import { Trash2, Plus } from 'lucide-react';
import { useTransferProductList } from '../../hooks/organelles/lists/useProductTransferList';
import { BatchDialog } from './BatchDialog';
import { TransferProductEntry } from '../../types/hooks';
import { BatchInfo } from '../../types/components';

interface ProductTransferListProps {
  locationId: string;
  entries: TransferProductEntry[];
  onEntriesChange: (entries: TransferProductEntry[]) => void;
}

export function ProductTransferList({ 
  locationId, 
  entries, 
  onEntriesChange 
}: ProductTransferListProps) {
  const {
    filteredProducts,
    loading,
    addNewEntry,
    removeEntry,
    updateEntry,
    selectProduct,
    selectBatch,
    getMaxQuantityForProduct,
    getBatchesForProduct,
  } = useTransferProductList({ 
    locationId, 
    entries, 
    onEntriesChange 
  });

  const handleBatchSelect = (index: number, batch: BatchInfo) => {
    selectBatch(index, batch);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Produtos para Transferência</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewEntry}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum produto adicionado ainda.</p>
          <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const maxQuantity = getMaxQuantityForProduct(entry.productId);
            const batches = getBatchesForProduct(entry.productId);

            return (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-3">
                    <Label>Produto *</Label>
                    <Combobox
                      options={filteredProducts}
                      value={entry.productId}
                      onValueChange={(value) => selectProduct(index, value)}
                      placeholder="Selecione um produto..."
                      searchPlaceholder="Buscar produto..."
                      emptyText="Nenhum produto encontrado"
                      disabled={loading}
                    />
                  </div>

                  <div className="col-span-1">
                    <Label>Estoque</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-muted-foreground">
                      <span className="text-sm">{maxQuantity}</span>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor={`quantity-${entry.id}`}>Qtd. *</Label>
                    <Input
                      id={`quantity-${entry.id}`}
                      type="number"
                      min="1"
                      max={maxQuantity}
                      value={entry.transferQuantity || ''}
                      onChange={(e) => updateEntry(index, 'transferQuantity', Number(e.target.value))}
                    />

                  </div>

                  <div className="col-span-3">
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

                  <div className="col-span-2">
                    <Label>Validade</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 text-muted-foreground">
                      <span className="text-sm">
                        {entry.expiryDate ? entry.expiryDate.toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEntry(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
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