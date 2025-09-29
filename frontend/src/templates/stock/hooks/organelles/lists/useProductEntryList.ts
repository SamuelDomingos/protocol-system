import { useState, useCallback } from 'react';
import { ProductEntry } from '../../../types';

export function useProductEntryList() {
  const [entries, setEntries] = useState<ProductEntry[]>([]);

  const addNewEntry = useCallback(() => {
    const newEntry: ProductEntry = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      batchNumber: '',
      expiryDate: undefined,
      unitPrice: 0,
      totalValue: 0,
    };
    setEntries(prev => [...prev, newEntry]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const updateEntry = useCallback((id: string, field: keyof ProductEntry, value: any) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };

        if (field === 'quantity' || field === 'unitPrice') {
          updatedEntry.totalValue = updatedEntry.quantity * updatedEntry.unitPrice;
        }
        
        return updatedEntry;
      }
      return entry;
    }));
  }, []);

  const selectProduct = useCallback((entryId: string, product: any) => {
    updateEntry(entryId, 'productId', product.id);
    updateEntry(entryId, 'productName', product.name);
    updateEntry(entryId, 'unitPrice', product.unitPrice || 0);
  }, [updateEntry]);

  const resetEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const getTotalValue = useCallback(() => {
    return entries.reduce((total, entry) => total + entry.totalValue, 0);
  }, [entries]);

  return {
    entries,
    addNewEntry,
    removeEntry,
    updateEntry,
    selectProduct,
    resetEntries,
    getTotalValue,
  };
}