import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { DatePicker } from '@/src/components/ui/date-picker';
import { Combobox } from '@/src/global/combobox/components/combobox';
import { Trash2, Plus } from 'lucide-react';
import { useProducts } from '../../../../hooks/atoms/useProducts';

interface ProductEntryListProps {
  productEntryList: ReturnType<typeof import('../../../../hooks/organelles/lists/useProductEntryList').useProductEntryList>;
}

export function ProductEntryList({ productEntryList }: ProductEntryListProps) {
  const {
    entries,
    addNewEntry,
    removeEntry,
    updateEntry,
    selectProduct,
  } = productEntryList;

  const { products } = useProducts();

  const productOptions = products.map(product => ({
    value: product.id,
    label: product.name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Produtos</h3>
        <Button type="button" onClick={addNewEntry} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4 bg-card">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Produto #{entries.indexOf(entry) + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEntry(entry.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-6 gap-4 items-end">
                <div className="col-span-2">
                  <Label>Produto</Label>
                  <Combobox
                    value={entry.productId}
                    onValueChange={(value) => {
                      if (value) {
                        const product = products.find(p => p.id === value);
                        if (product) {
                          selectProduct(entry.id, product);
                        }
                      }
                    }}
                    options={productOptions}
                    placeholder="Selecionar produto..."
                    searchPlaceholder="Buscar produto..."
                    emptyText="Nenhum produto encontrado"
                  />
                </div>

                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={entry.quantity}
                    onChange={(e) => updateEntry(entry.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Lote</Label>
                  <Input
                    value={entry.batchNumber}
                    onChange={(e) => updateEntry(entry.id, 'batchNumber', e.target.value)}
                    placeholder="Ex: L001"
                  />
                </div>

                <div>
                  <Label>Validade</Label>
                  <DatePicker
                    date={entry.expiryDate}
                    onDateChange={(date) => updateEntry(entry.id, 'expiryDate', date)}
                    placeholder="Selecionar data"
                  />
                </div>

                <div>
                  <Label>Valor Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={entry.unitPrice}
                    onChange={(e) => updateEntry(entry.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Valor Total</Label>
                  <Input
                    type="text"
                    value={`R$ ${entry.totalValue.toFixed(2).replace('.', ',')}`}
                    disabled
                    className="bg-muted font-medium text-right"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}