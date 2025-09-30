import { useState, useEffect, useCallback } from 'react';
import { TransferProductEntry } from '../../../types/hooks';
import { 
  getProductsByLocation, 
  getBatchesByProductAndLocation 
} from '@/src/templates/stock/services/stockService';
import { ProductWithStock } from '@/src/lib/api/types';
import { BatchInfo } from '../../../types/components';

interface UseTransferProductListProps {
  locationId: string;
  entries: TransferProductEntry[];
  onEntriesChange: (entries: TransferProductEntry[]) => void;
}

interface ProductOption {
  value: string;
  label: string;
}

export function useTransferProductList({ 
  locationId, 
  entries, 
  onEntriesChange 
}: UseTransferProductListProps) {
  const [stockData, setStockData] = useState<ProductWithStock[]>([]);
  const [batchesData, setBatchesData] = useState<Record<string, BatchInfo[]>>({});
  const [loading, setLoading] = useState(false);

  const filteredProducts: ProductOption[] = stockData.map(product => ({
    value: product.productId,
    label: product.product.name,
  }));

  const fetchProducts = useCallback(async () => {
    if (!locationId) return;
    
    setLoading(true);
    try {
      const products = await getProductsByLocation(locationId);
      setStockData(products);
    } catch (error) {
      console.error(error);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  const fetchBatchesForProduct = useCallback(async (productId: string) => {
    if (!productId || !locationId) return;

    try {
      const batches = await getBatchesByProductAndLocation(productId, locationId);

      const mappedBatches: BatchInfo[] = batches.map(batch => ({
        id: batch.id,
        sku: batch.sku,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate,
        price: parseFloat(batch.price || '0'),
        product: {
          name: batch.product.name,
          unitPrice: parseFloat(batch.product.unitPrice || '0')
        }
      }));
      
      setBatchesData(prev => ({
        ...prev,
        [productId]: mappedBatches
      }));
    } catch (error) {
      console.error(error);
      setBatchesData(prev => ({
        ...prev,
        [productId]: []
      }));
    }
  }, [locationId]);

  // Obter quantidade máxima disponível para um produto
  const getMaxQuantityForProduct = useCallback((productId: string): number => {
    const product = stockData.find(p => p.productId === productId);
    return product?.quantity || 0;
  }, [stockData]);

  const getBatchesForProduct = useCallback((productId: string): BatchInfo[] => {
    return batchesData[productId] || [];
  }, [batchesData]);

  const addNewEntry = useCallback(() => {
    const newEntry: TransferProductEntry = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      batchNumber: '',
      expiryDate: undefined,
      availableQuantity: 0,
      transferQuantity: 0,
      unitPrice: 0,
    };
    
    const newEntries = [...entries, newEntry];
    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  const removeEntry = useCallback((index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  const updateEntry = useCallback((index: number, field: keyof TransferProductEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value,
    };

    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  const selectProduct = useCallback(async (index: number, productId: string) => {
    const product = stockData.find(p => p.productId === productId);
    if (product) {
      const newEntries = [...entries];
      newEntries[index] = {
        ...newEntries[index],
        productId,
        productName: product.product.name,
        availableQuantity: product.quantity,
        unitPrice: parseFloat(String(product.product.unitPrice || '0')),
        batchNumber: '',
        expiryDate: undefined,
      };
      onEntriesChange(newEntries);

      await fetchBatchesForProduct(productId);
    }
  }, [stockData, entries, onEntriesChange, fetchBatchesForProduct]);

  const selectBatch = useCallback((index: number, batchInfo: BatchInfo) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      batchNumber: batchInfo.sku,
      expiryDate: batchInfo.expiryDate ? new Date(batchInfo.expiryDate) : undefined,
      unitPrice: batchInfo.price,
    };
    onEntriesChange(newEntries);
  }, [entries, onEntriesChange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    filteredProducts,
    loading,
    addNewEntry,
    removeEntry,
    updateEntry,
    selectProduct,
    selectBatch,
    getMaxQuantityForProduct,
    getBatchesForProduct,
  };
}